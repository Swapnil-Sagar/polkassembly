// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, DislikeOutlined, LikeOutlined, PaperClipOutlined } from '@ant-design/icons';
import { Divider, Modal, Progress, Skeleton, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { poppins } from 'pages/_app';
import React, { FC, useContext, useEffect, useState } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { noTitle } from 'src/global/noTitle';
import useCurrentBlock from 'src/hooks/useCurrentBlock';
import OnchainCreationLabel from 'src/ui-components/OnchainCreationLabel';
import StatusTag from 'src/ui-components/StatusTag';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';
import TopicTag from '~src/ui-components/TopicTag';
import BN from 'bn.js';
import { chainProperties } from 'src/global/networkConstants';
import NewChatIcon from '~assets/icons/chat-icon.svg';
import TagsIcon from '~assets/icons/tags-icon.svg';
import { getFormattedLike } from '~src/util/getFormattedLike';
import { useApiContext, useNetworkContext } from '~src/context';
import { useRouter } from 'next/router';
import getQueryToTrack from '~src/util/getQueryToTrack';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { getStatusBlock } from '~src/util/getStatusBlock';
import { IPeriod } from '~src/types';
import { getPeriodData } from '~src/util/getPeriodData';
import CloseIcon from '~assets/icons/close.svg';
import checkGov2Route from '~src/util/checkGov2Route';
import { ProposalType } from '~src/global/proposalType';

const BlockCountdown = dynamic(() => import('src/components/BlockCountdown'), {
	loading: () => <Skeleton.Button active />,
	ssr: false
});
const VotesProgressInListing = dynamic(() => import('~src/ui-components/VotesProgressInListing'), {
	loading: () => <Skeleton.Button active />,
	ssr: false
});

interface IGovernanceProps {
	postReactionCount: {
		'👍': number;
		'👎': number;
	};
	address: string;
	username?: string;
	className?: string;
	commentsCount: number;
	created_at?: Date;
	end?: number;
	method?: string;
	onchainId?: string | number | null;
	status?: string | null;
	tipReason?: string;
	title?: string | null;
	topic?: string;
	isTip?: boolean;
	tip_index?: number | null;
	isCommentsVisible?: boolean;
	tags?: string[] | [];
	spam_users_count?: number;
	cid?: string;
	requestedAmount?: number;
	tally?: any;
	timeline?: any[];
	statusHistory?: any[];
	index?: number;
	proposalType?: ProposalType | string;
	votesData?: any;
	trackNumber?: number | null;
	identityId?: string | null;
}

const GovernanceCard: FC<IGovernanceProps> = (props) => {
	const {
		postReactionCount,
		address,
		cid,
		className,
		commentsCount,
		created_at,
		end = 0,
		method,
		onchainId,
		status,
		tipReason,
		title,
		topic,
		isTip,
		tip_index,
		isCommentsVisible = true,
		username,
		tags,
		spam_users_count,
		requestedAmount,
		tally,
		timeline,
		trackNumber,
		statusHistory = [],
		index = 0,
		proposalType,
		votesData,
		identityId = null
	} = props;

	const router = useRouter();
	const currentUser = useContext(UserDetailsContext);
	const { network } = useNetworkContext();
	const { api, apiReady } = useApiContext();

	let titleString = title || method || tipReason || noTitle;
	const titleTrimmed = titleString.match(/.{1,80}(\s|$)/g)![0];
	titleString = `${titleTrimmed} ${titleTrimmed.length != titleString.length ? '...' : ''}`;

	const mainTitle = <span className={tipReason && 'tipTitle'}>{titleString}</span>;
	const subTitle = title && tipReason && method && <h5>{title}</h5>;
	const currentBlock = useCurrentBlock()?.toNumber() || 0;
	const ownProposal = currentUser?.addresses?.includes(address);
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [tagsModal, setTagsModal] = useState<boolean>(false);

	const [polkadotProposer, setPolkadotProposer] = useState<string>('');

	const tokenDecimals = chainProperties[network]?.tokenDecimals;
	const confirmedStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Confirmed');
	const decidingStatusBlock = getStatusBlock(timeline || [], ['ReferendumV2', 'FellowshipReferendum'], 'Deciding');
	const isProposalFailed = ['Rejected', 'TimedOut', 'Cancelled', 'Killed'].includes(status || '');

	const requestedAmountFormatted = requestedAmount ? new BN(requestedAmount).div(new BN(10).pow(new BN(tokenDecimals))).toString() : 0;

	const [decision, setDecision] = useState<IPeriod>();
	const [remainingTime, setRemainingTime] = useState<string>('');
	const decidingBlock = statusHistory?.filter((status) => status.status === 'Deciding')?.[0]?.block || 0;
	const convertRemainingTime = (preiodEndsAt: any) => {
		const diffMilliseconds = preiodEndsAt.diff();

		const diffDuration = dayjs.duration(diffMilliseconds);
		const diffDays = diffDuration.days();
		const diffHours = diffDuration.hours();
		const diffMinutes = diffDuration.minutes();
		if (!diffDays) {
			return `${diffHours}hrs : ${diffMinutes}mins `;
		}
		return `${diffDays}d  : ${diffHours}hrs : ${diffMinutes}mins `;
	};

	const getProposerFromPolkadot = async (identityId: string) => {
		if (!api || !apiReady) return;

		const didKeys = await api.query.identity.didKeys.keys(identityId);
		if (didKeys.length > 0) {
			const didKey = didKeys[0];
			const key = didKey.args[1].toJSON();
			return key;
		}
	};

	useEffect(() => {
		if (!window || !checkGov2Route(router.pathname, router.query) || trackNumber === null) return;
		const trackDetails = getQueryToTrack(router.pathname.split('/')[1], network);

		if (!created_at || !trackDetails) return;

		const prepare = getPeriodData(network, dayjs(created_at), trackDetails, 'preparePeriod');

		const decisionPeriodStartsAt = decidingStatusBlock && decidingStatusBlock.timestamp ? dayjs(decidingStatusBlock.timestamp) : prepare.periodEndsAt;
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackDetails, 'decisionPeriod');
		setDecision(decision);
		setRemainingTime(convertRemainingTime(decision.periodEndsAt));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (!identityId || address) return;

		(async () => {
			const proposer = await getProposerFromPolkadot(identityId);
			setPolkadotProposer(proposer as string);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	return (
		<>
			<div
				className={`${className} ${
					ownProposal && 'border-l-4 border-l-pink_primary'
				} min-h-[120px] border-2 border-[#DCDFE350] transition-all duration-200 hover:border-pink_primary hover:shadow-xl xs:hidden sm:flex sm:p-3`}
			>
				<div className='flex-1 flex-col sm:mt-2.5 sm:flex sm:justify-between'>
					<div className='flex items-center justify-between'>
						<div className='flex flex-grow'>
							<span className='flex-none text-center font-medium text-bodyBlue sm:w-[120px]'>#{isTip ? tip_index : onchainId}</span>
							<OnchainCreationLabel
								address={address || polkadotProposer}
								username={username}
							/>
						</div>
						<div className='flex items-center justify-end'>
							{status && (
								<StatusTag
									className='sm:mr-10'
									status={status}
								/>
							)}
						</div>
					</div>
					<div className='mt-1 flex items-center justify-between'>
						<div className='ml-[120px] flex flex-grow'>
							<h1 className='mt-0.5 flex overflow-hidden text-sm text-bodyBlue lg:max-w-none'>
								<span className='break-all text-sm font-medium text-bodyBlue'>{mainTitle}</span>
							</h1>
							<h2 className='text-sm font-medium text-bodyBlue'>{subTitle}</h2>
						</div>
						{requestedAmount && (
							<div className='flex items-center justify-center'>
								{requestedAmount > 100 ? (
									<span className='whitespace-pre text-sm font-medium text-lightBlue sm:mr-[2.63rem]'>
										{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}
									</span>
								) : (
									<span className='whitespace-pre text-sm font-medium text-lightBlue sm:mr-[2.65rem]'>
										{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}
									</span>
								)}
							</div>
						)}
					</div>
					<div className='flex-col items-start text-xs font-medium text-bodyBlue xs:hidden sm:mb-1 sm:ml-[120px] sm:mt-0 sm:flex lg:flex-row lg:items-center'>
						<div className='flex items-center gap-x-2 lg:h-[32px]'>
							<div className='items-center justify-center gap-x-1.5 xs:hidden sm:flex'>
								<LikeOutlined style={{ color: '#485F7D' }} />
								<span className='text-lightBlue'>{getFormattedLike(postReactionCount['👍'])}</span>
							</div>
							<div className='mr-0.5 items-center justify-center gap-x-1.5 xs:hidden sm:flex'>
								<DislikeOutlined style={{ color: '#485F7D' }} />
								<span className='text-lightBlue'>{getFormattedLike(postReactionCount['👎'])}</span>
							</div>
							{isCommentsVisible ? (
								<>
									<div className='items-center text-lightBlue xs:hidden sm:flex'>
										<NewChatIcon
											style={{
												color: '#485F7D'
											}}
											className='mr-1 text-lightBlue'
										/>{' '}
										{commentsCount}
									</div>
								</>
							) : null}
							{tags && tags.length > 0 && (
								<>
									<Divider
										type='vertical'
										className='max-lg:hidden'
										style={{ borderLeft: '1px solid #90A0B7' }}
									/>
									{tags?.slice(0, 2).map((tag, index) => (
										<div
											key={index}
											className='rounded-xl border-[1px] border-solid border-[#D2D8E0] px-[14px] py-1 text-[10px] font-medium text-lightBlue'
										>
											{tag}
										</div>
									))}
									{tags.length > 2 && (
										<span
											className='text-bodyBlue'
											style={{ background: '#D2D8E080', borderRadius: '20px', padding: '4px 8px' }}
											onClick={(e) => {
												e.stopPropagation();
												e.preventDefault();
												setTagsModal(true);
											}}
										>
											+{tags.length - 2}
										</span>
									)}
								</>
							)}

							<Divider
								type='vertical'
								style={{ borderLeft: '1px solid #485F7D' }}
							/>
							{cid ? (
								<>
									<Link
										href={`https://ipfs.io/ipfs/${cid}`}
										target='_blank'
									>
										{' '}
										<PaperClipOutlined /> IPFS
									</Link>
									<Divider
										type='vertical'
										style={{ borderLeft: '1px solid #485F7D' }}
									/>
								</>
							) : null}
							{relativeCreatedAt && (
								<>
									<div className='flex items-center text-lightBlue sm:mt-0'>
										<ClockCircleOutlined className='mr-1' /> <span className='whitespace-nowrap'>{relativeCreatedAt}</span>
									</div>
								</>
							)}
							{decision && decidingStatusBlock && !confirmedStatusBlock && !isProposalFailed && (
								<>
									<Divider
										type='vertical'
										className='max-sm:hidden'
										style={{ borderLeft: '1px solid #90A0B7' }}
									/>
									<Tooltip
										overlayClassName='max-w-none'
										title={
											<div className={`p-1.5 ${poppins.className} ${poppins.variable} flex items-center whitespace-nowrap text-xs`}>{`Deciding ends in ${remainingTime} ${
												decidingBlock !== 0 ? `#${decidingBlock}` : ''
											}`}</div>
										}
										color='#575255'
									>
										<div className='mt-2 min-w-[30px]'>
											<Progress
												strokeWidth={5}
												percent={decision.periodPercent || 0}
												strokeColor='#407AFC'
												trailColor='#D4E0FC'
											/>
										</div>
									</Tooltip>
								</>
							)}
							{(votesData?.data || tally) && (
								<>
									<Divider
										type='vertical'
										className='max-sm:hidden'
										style={{ borderLeft: '1px solid #90A0B7' }}
									/>
									<VotesProgressInListing
										index={index}
										proposalType={proposalType}
										votesData={votesData}
										onchainId={onchainId}
										status={status}
										tally={tally}
									/>
								</>
							)}
							{topic ? (
								<div className='flex items-center sm:-mt-1'>
									<Divider
										type='vertical'
										className='sm:mt-1'
										style={{ borderLeft: '1px solid #485F7D' }}
									/>
									<TopicTag
										className='sm:mx-1 sm:mt-0'
										topic={topic}
									/>
								</div>
							) : null}
						</div>

						{!!end && !!currentBlock && (
							<div className='flex items-center text-lightBlue'>
								<Divider
									className='hidden lg:inline-block'
									type='vertical'
									style={{ borderLeft: '1px solid #485F7D' }}
								/>
								<ClockCircleOutlined className='mr-1' />
								{end > currentBlock ? (
									<span>
										<BlockCountdown endBlock={end} /> remaining
									</span>
								) : (
									<span>
										ended <BlockCountdown endBlock={end} />
									</span>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
			<div
				className={`${className} ${
					ownProposal && 'border-l-4 border-l-pink_primary'
				} h-auto min-h-[147px] border-2 border-grey_light transition-all duration-200  hover:border-pink_primary hover:shadow-xl xs:flex xs:px-2 xs:py-2 sm:hidden md:pb-6`}
			>
				<div className='flex-1 flex-col xs:mt-1 xs:flex sm:hidden'>
					<div className='justify-between xs:flex sm:my-0 sm:hidden'>
						{topic && (
							<div>
								<TopicTag
									className='xs:mx-1'
									topic={topic}
								/>
							</div>
						)}
						{requestedAmount && (
							<div className='xs:mr-5 sm:m-0'>
								{requestedAmount > 100 ? (
									<span className='text-sm font-medium text-lightBlue'>
										{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}
									</span>
								) : (
									<span className='text-sm font-medium text-lightBlue'>
										{requestedAmount} {chainProperties[network]?.tokenSymbol}
									</span>
								)}
							</div>
						)}
					</div>
					<div className='items-center justify-between gap-x-2 xs:flex sm:hidden'>
						{spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0 ? (
							<div className='flex items-center justify-center'>
								<Tooltip
									color='#E5007A'
									title='This post could be a spam.'
								>
									<WarningMessageIcon className='text-xl text-[#FFA012]' />
								</Tooltip>
							</div>
						) : null}
					</div>
					<div className='max-xs-hidden mx-1 my-3 text-sm font-medium text-bodyBlue'>
						#{isTip ? tip_index : onchainId} {mainTitle} {subTitle}
					</div>

					<div className='flex-col gap-3 pl-1 text-xs font-medium text-bodyBlue xs:flex sm:hidden lg:flex-row lg:items-center'>
						<div className='h-[30px] flex-shrink-0 items-center xs:flex xs:justify-start sm:hidden'>
							<OnchainCreationLabel
								address={address}
								truncateUsername
								username={username}
							/>
							<Divider
								type='vertical'
								className='max-lg:hidden xs:mt-0.5 xs:inline-block'
								style={{ borderLeft: '1px solid #485F7D' }}
							/>
							{relativeCreatedAt && (
								<>
									<div className='mt-0 flex items-center text-lightBlue'>
										<ClockCircleOutlined className='mr-1' /> <span> {relativeCreatedAt}</span>
									</div>
								</>
							)}
							{decision && decidingStatusBlock && !confirmedStatusBlock && !isProposalFailed && (
								<div className='flex items-center'>
									<Divider
										type='vertical'
										className='max-lg:hidden xs:mt-0.5 xs:inline-block'
										style={{ borderLeft: '1px solid #90A0B7' }}
									/>
									<div className='mt-2 min-w-[30px]'>
										<Progress
											percent={decision.periodPercent || 0}
											strokeColor='#407AFC'
											trailColor='#D4E0FC'
											strokeWidth={5}
										/>
									</div>
								</div>
							)}
							{(votesData?.data || tally) && network !== 'polymesh' && (
								<div className='flex items-center'>
									<Divider
										type='vertical'
										className='max-lg:hidden xs:mt-0.5 xs:inline-block'
										style={{ borderLeft: '1px solid #90A0B7' }}
									/>
									<div>
										<VotesProgressInListing
											index={index}
											proposalType={proposalType}
											votesData={votesData}
											onchainId={onchainId}
											status={status}
											tally={tally}
										/>
									</div>
								</div>
							)}
						</div>

						<div className='mb-1 items-center justify-between xs:flex xs:gap-x-2'>
							{status && <StatusTag status={status} />}
							{tags && tags.length > 0 && (
								<div className='flex'>
									<Divider
										type='vertical'
										className='max-lg:hidden'
										style={{ borderLeft: '1px solid #90A0B7' }}
									/>
									<div className='flex gap-1'>
										{tags?.slice(0, 2).map((tag, index) => (
											<div
												key={index}
												className='rounded-xl border-[1px] border-solid border-[#D2D8E0] px-[14px] py-1 text-[10px] font-medium text-lightBlue'
											>
												{tag}
											</div>
										))}
										{tags.length > 2 && (
											<span
												className='text-bodyBlue'
												style={{ background: '#D2D8E080', borderRadius: '20px', padding: '4px 8px' }}
												onClick={(e) => {
													e.stopPropagation();
													e.preventDefault();
													setTagsModal(true);
												}}
											>
												+{tags.length - 2}
											</span>
										)}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<Modal
				open={tagsModal}
				onCancel={(e) => {
					e.stopPropagation();
					e.preventDefault();
					setTagsModal(false);
				}}
				footer={false}
				closeIcon={<CloseIcon />}
				className={`${poppins.variable} ${poppins.className} h-[120px] max-w-full  shrink-0 max-sm:w-[100%]`}
				title={
					<>
						<label className='mb-2 text-lg font-medium tracking-wide text-bodyBlue'>
							<TagsIcon className='mr-2' />
							Tags
						</label>
						<Divider
							type='horizontal'
							style={{ borderLeft: '2px solid #D2D8E0' }}
						/>
					</>
				}
			>
				<div className='mt-3 flex flex-wrap gap-2'>
					{tags && tags.length > 0 && (
						<>
							{tags?.map((tag, index) => (
								<div
									key={index}
									className='rounded-xl border-[1px] border-solid border-[#D2D8E0] px-4 py-1 text-xs font-normal text-lightBlue'
								>
									{tag}
								</div>
							))}
						</>
					)}
				</div>
			</Modal>
		</>
	);
};

export default styled(GovernanceCard)`
	.ant-progress.ant-progress-circle .ant-progress-text {
		display: none;
	}
	.ant-progress .ant-progress-inner:not(.ant-progress-circle-gradient) .ant-progress-circle-path {
		stroke: #ff3c5f;
	}
	.ant-progress-circle > circle:nth-child(3) {
		stroke: #2ed47a !important;
	}
	.ant-progress .ant-progress-text {
		display: none;
	}
	.ant-progress.ant-progress-show-info .ant-progress-outer {
		margin-inline-end: 0px;
		padding-inline-end: 0px;
	}
	.progress-rotate {
		transform: rotate(-87deg);
	}
`;
