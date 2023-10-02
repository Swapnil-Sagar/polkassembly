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
import { CommentsIcon } from '~src/ui-components/CustomIcons';
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
import checkGov2Route from '~src/util/checkGov2Route';
import { ProposalType } from '~src/global/proposalType';
import { useTheme } from 'next-themes';
import { CloseIcon } from '~src/ui-components/CustomIcons';

const BlockCountdown = dynamic(() => import('src/components/BlockCountdown'),{
	loading: () => <Skeleton.Button active />,
	ssr: false
});
const VotesProgressInListing = dynamic(() => import('~src/ui-components/VotesProgressInListing'),{
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
	className?: string
	commentsCount: number
	created_at?: Date
	end?: number
	method?: string
	onchainId?: string | number | null
	status?: string | null
	tipReason?: string
	title?: string | null
	topic?: string
	isTip?: boolean;
	tip_index?: number | null;
	isCommentsVisible?: boolean;
	tags?: string[] | [];
	spam_users_count?: number;
	cid?:string;
	requestedAmount?:number;
  tally?:  any;
  timeline?: any[];
  statusHistory?: any[];
  index?: number;
  proposalType?: ProposalType | string;
  votesData?: any;
  trackNumber?: number | null
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

	const router= useRouter();
	const currentUser = useContext(UserDetailsContext);
	const { network } = useNetworkContext();
	const { api, apiReady } = useApiContext();
	const { resolvedTheme:theme } = useTheme();

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
	const decidingBlock = statusHistory?.filter((status) => status.status === 'Deciding' )?.[0]?.block || 0;
	const convertRemainingTime = (preiodEndsAt: any ) => {

		const diffMilliseconds = preiodEndsAt.diff();

		const diffDuration = dayjs.duration(diffMilliseconds);
		const diffDays = diffDuration.days();
		const diffHours = diffDuration.hours();
		const diffMinutes = diffDuration.minutes();
		if(!diffDays){
			return (`${diffHours}hrs : ${diffMinutes}mins `);
		}
		return (`${diffDays}d  : ${diffHours}hrs : ${diffMinutes}mins `);

	};

	const getProposerFromPolkadot= async(identityId: string) => {
		if(!api || !apiReady) return;

		const didKeys = await api.query.identity.didKeys.keys(identityId);
		if(didKeys.length > 0){
			const didKey = didKeys[0];
			const key = didKey.args[1].toJSON();
			return key;
		}
	};

	useEffect(() => {

		if(!window || !checkGov2Route(router.pathname, router.query) || (trackNumber === null)) return;
		const trackDetails = getQueryToTrack(router.pathname.split('/')[1], network);

		if (!created_at || !trackDetails) return;

		const prepare = getPeriodData(network, dayjs(created_at), trackDetails, 'preparePeriod');

		const decisionPeriodStartsAt = ((decidingStatusBlock && decidingStatusBlock.timestamp)? dayjs(decidingStatusBlock.timestamp): prepare.periodEndsAt);
		const decision = getPeriodData(network, decisionPeriodStartsAt, trackDetails, 'decisionPeriod');
		setDecision(decision);
		setRemainingTime(convertRemainingTime(decision.periodEndsAt));

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if(!identityId || address) return;

		(async() => {
			const proposer = await getProposerFromPolkadot(identityId );
			setPolkadotProposer(proposer as string);
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[api, apiReady]);

	return (
		<>
			<div className={`${className} ${ownProposal && 'border-l-pink_primary border-l-4'} border-2 border-solid border-[#DCDFE350] hover:border-pink_primary hover:shadow-xl transition-all duration-200 sm:p-3 min-h-[120px] sm:flex xs:hidden dark:border-[#1F2125] dark:border-[1px]`}>
				<div className="sm:flex flex-col sm:justify-between flex-1 sm:mt-2.5">
					<div className="flex justify-between items-center">
						<div className="flex flex-grow">
							<span className='font-medium text-center flex-none sm:w-[120px] text-bodyBlue dark:text-blue-dark-high dark:font-normal'>#{isTip? tip_index: onchainId}</span>
							<OnchainCreationLabel address={address || polkadotProposer} username={username} />
						</div>
						<div className="flex justify-end items-center">
							{status && <StatusTag className='sm:mr-10' status={status} theme={theme} />}
						</div>
					</div>
					<div className="flex justify-between items-center mt-1">
						<div className="flex flex-grow ml-[120px]">
							<h1 className='text-blue-light-high dark:text-blue-dark-high text-sm mt-0.5 flex overflow-hidden lg:max-w-none'>
								<span className='break-all text-blue-light-high dark:text-blue-dark-high font-medium text-sm dark:font-normal'>{ mainTitle }</span>
							</h1>
							<h2 className='text-blue-light-high dark:text-blue-dark-high font-medium text-sm dark:font-normal'>{subTitle}</h2>
						</div>
						{
							requestedAmount &&
							<div className='flex justify-center items-center'>
								{requestedAmount > 100 ?
									<span className='text-lightBlue dark:text-blue-dark-high dark:font-normal text-sm font-medium sm:mr-[2.63rem] whitespace-pre'>{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}</span>
									:
									<span className='text-lightBlue dark:text-blue-dark-high dark:font-normal text-sm font-medium sm:mr-[2.65rem] whitespace-pre'>{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}</span>
								}
							</div>
						}
					</div>
					<div className="font-medium text-blue-light-high dark:text-blue-dark-high text-xs sm:flex xs:hidden flex-col lg:flex-row items-start lg:items-center sm:mb-1 sm:mt-0 sm:ml-[120px]">
						<div className='flex items-center gap-x-2 lg:h-[32px]'>
							<div className='xs:hidden sm:flex items-center justify-center gap-x-1.5'>
								<LikeOutlined className='text-lightBlue dark:text-icon-dark-inactive' />
								<span className='text-lightBlue dark:text-icon-dark-inactive'>{getFormattedLike(postReactionCount['👍'])}</span>
							</div>
							<div className='xs:hidden sm:flex items-center justify-center gap-x-1.5 mr-0.5'>
								<DislikeOutlined className='text-lightBlue dark:text-icon-dark-inactive' />
								<span className='text-lightBlue dark:text-icon-dark-inactive'>{getFormattedLike(postReactionCount['👎'])}</span>
							</div>
							{
								isCommentsVisible?
									<>
										<div className='xs:hidden text-lightBlue dark:text-icon-dark-inactive sm:flex items-center'>
											<CommentsIcon className='mr-1 text-lightBlue dark:text-icon-dark-inactive' /> {commentsCount}
										</div>
									</>
									: null
							}
							{tags && tags.length > 0 && <>
								<Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />
								{ tags?.slice(0,2).map((tag, index) =>
									(<div key={index} className='text-lightBlue rounded-xl px-[14px] py-1 border-[#D2D8E0] dark:border-separatorDark border-solid border-[1px] font-medium text-[10px]' >
										{tag}
									</div>))}
								{tags.length>2 && <span className='text-blue-light-high dark:text-blue-dark-high' style={{ background:'#D2D8E080' , borderRadius:'20px', padding:'4px 8px' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2}
								</span>}
							</>}

							<Divider type="vertical" className='max-sm:hidden sm:mt-1 border-l-1 border-lightBlue dark:border-blue-dark-medium' />
							{
								cid ?
									<>
										<Link href={`https://ipfs.io/ipfs/${cid}`} target="_blank"> <PaperClipOutlined /> IPFS</Link>
										<Divider type="vertical" className='max-sm:hidden sm:mt-1 border-l-1 border-lightBlue dark:border-blue-dark-medium' />
									</> : null
							}
							{relativeCreatedAt && <>
								<div className='flex text-lightBlue dark:text-icon-dark-inactive items-center sm:mt-0'>
									<ClockCircleOutlined className='mr-1 dark:border-blue-dark-medium' /> <span className='whitespace-nowrap'>{relativeCreatedAt}</span>
								</div>
							</>}
							{(decision && (decidingStatusBlock && !confirmedStatusBlock) && !isProposalFailed) && <>
								<Divider type="vertical" className='max-sm:hidden sm:mt-1 border-l-1 border-[#90A0B7] dark:border-blue-dark-medium' />
								<Tooltip overlayClassName='max-w-none' title={<div className={`p-1.5 ${poppins.className} ${poppins.variable} whitespace-nowrap flex items-center text-xs`}>{ `Deciding ends in ${remainingTime} ${(decidingBlock !== 0) ? `#${decidingBlock}` :''}`}</div>} color='#575255'>
									<div className='min-w-[30px] mt-2'>
										<Progress strokeWidth={5} percent={decision.periodPercent || 0} strokeColor='#407AFC' trailColor='#D4E0FC'/>
									</div>
								</Tooltip>
							</>}
							{(votesData?.data || tally) && <>
								<Divider type="vertical" className='max-sm:hidden sm:mt-1 border-l-1 border-[#90A0B7] dark:border-blue-dark-medium' />
								<VotesProgressInListing theme={theme} index={index} proposalType={proposalType} votesData={votesData} onchainId={onchainId} status={status} tally={tally}/>
							</>
							}
							{
								topic?
									<div className='flex items-center sm:-mt-1'>
										<Divider type="vertical" className='max-sm:hidden sm:mt-1 border-l-1 border-lightBlue dark:border-blue-dark-medium' />
										<TopicTag className='sm:mt-0 sm:mx-1' theme={theme} topic={topic} />
									</div>
									: null
							}
						</div>

						{!!end && !!currentBlock &&
							<div className="flex text-lightBlue dark:icon-dark-inactive items-center">
								<Divider className='hidden lg:inline-block border-l-1 border-lightBlue dark:border-blue-dark-medium' type="vertical" />
								<ClockCircleOutlined className='mr-1 dark:border-blue-dark-medium' />
								{
									end > currentBlock
										? <span><BlockCountdown endBlock={end}/> remaining</span>
										: <span>ended <BlockCountdown endBlock={end}/></span>
								}
							</div>
						}

					</div>
				</div>
			</div>
			<div className={`${className} ${ownProposal && 'border-l-pink_primary border-l-4'} border-2 border-solid border-[#DCDFE350] hover:border-pink_primary hover:shadow-xl transition-all duration-200  xs:px-2 xs:py-2 md:pb-6 min-h-[147px] xs:flex h-auto sm:hidden dark:border-[#1F2125] dark:border-[1px]`}>
				<div className="sm:hidden xs:flex flex-col flex-1 xs:mt-1">
					<div className="xs:flex sm:hidden justify-between sm:my-0">
						{
							topic &&
							<div>
								<TopicTag theme={theme} className='xs:mx-1' topic={topic} />
							</div>
						}
						{
							requestedAmount &&
							<div className='xs:mr-5 sm:m-0'>
								{requestedAmount > 100 ?
									<span className='text-lightBlue dark:text-blue-dark-high text-sm font-medium dark:font-normal'>{requestedAmountFormatted} {chainProperties[network]?.tokenSymbol}</span>
									:
									<span className='text-lightBlue dark:text-blue-dark-high text-sm font-medium dark:font-normal'>{requestedAmount} {chainProperties[network]?.tokenSymbol}</span>
								}
							</div>
						}
					</div>
					<div className='sm:hidden xs:flex justify-between items-center gap-x-2'>
						{
							spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0?
								<div className='flex items-center justify-center'>
									<Tooltip color="#E5007A" title="This post could be a spam.">
										<WarningMessageIcon className='text-xl text-[#FFA012]' />
									</Tooltip>
								</div>
								: null
						}
					</div>
					<div className='max-xs-hidden my-3 mx-1 text-blue-light-high dark:text-blue-dark-high font-medium text-sm dark:font-normal'>
						#{isTip? tip_index: onchainId} {mainTitle} {subTitle}
					</div>

					<div className="font-medium text-blue-light-high dark:text-blue-dark-high text-xs sm:hidden xs:flex flex-col lg:flex-row lg:items-center pl-1 gap-3 dark:font-normal">
						<div className="sm:hidden xs:flex xs:justify-start items-center h-[30px] flex-shrink-0">
							<OnchainCreationLabel address={address} truncateUsername username={username} />
							<Divider type="vertical" className='max-lg:hidden xs:inline-block xs:mt-0.5 border-l-1 border-lightBlue dark:border-blue-dark-medium' />
							{relativeCreatedAt && <>
								<div className='flex text-lightBlue dark:text-icon-dark-inactive mt-0 items-center'>
									<ClockCircleOutlined className='mr-1 dark:border-blue-dark-medium' /> <span> {relativeCreatedAt}</span>
								</div>
							</>}
							{(decision  && (decidingStatusBlock && !confirmedStatusBlock) && !isProposalFailed) && <div className='flex items-center'>
								<Divider type="vertical" className='max-lg:hidden xs:inline-block xs:mt-0.5 border-l-1 border-[#90A0B7] dark:border-blue-dark-medium' />
								<div className='min-w-[30px] mt-2'>
									<Progress percent={decision.periodPercent || 0} strokeColor='#407AFC' trailColor='#D4E0FC' strokeWidth={5} />
								</div>
							</div>}
							{ (votesData?.data || tally) && (network !== 'polymesh') && <div className='flex items-center'>
								<Divider type="vertical" className='max-lg:hidden xs:inline-block xs:mt-0.5' style={{ borderLeft: '1px solid #90A0B7' }} />
								<div>
									<VotesProgressInListing theme={theme} index={index} proposalType={proposalType} votesData={votesData} onchainId={onchainId} status={status} tally={tally}/>
								</div>
							</div>}
						</div>

						<div className='xs:flex justify-between xs:gap-x-2 mb-1 items-center'>
							{status  && <StatusTag status={status} theme={theme} />}
							{tags && tags.length > 0 && <div className='flex'>
								<Divider type="vertical" className='max-lg:hidden' style={{ borderLeft: '1px solid #90A0B7' }} />
								<div className='flex gap-1'>
									{ tags?.slice(0,2).map((tag, index) =>
										(<div key={index} className='text-lightBlue rounded-xl px-[14px] py-1 border-[#D2D8E0] dark:border-separatorDark border-solid border-[1px] font-medium text-[10px]' >
											{tag}
										</div>))}
									{tags.length>2 && <span className='text-blue-light-high dark:text-blue-dark-high' style={{ background:'#D2D8E080' , borderRadius:'20px', padding:'4px 8px' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2}
									</span>}</div>
							</div>}
						</div>

					</div>
				</div>
			</div>
			<Modal
				open= {tagsModal}
				onCancel={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(false);}}
				footer={false}
				closeIcon={<CloseIcon className='dark:text-icon-dark-inactive text-lightBlue' />}
				className={`${theme === 'dark'? '[&>.ant-modal-content]:bg-section-dark-overlay' : ''} ${poppins.variable} ${poppins.className} max-w-full shrink-0  max-sm:w-[100%] h-[120px]`}
				title={<>
					<div className='text-lg tracking-wide font-medium text-blue-light-high dark:text-blue-dark-high mb-2 dark:bg-black'>
						<TagsIcon className='mr-2' />
							Tags
					</div>
					<Divider className='dark:border-l-1 dark:border-separatorDark' type="horizontal" style={{ borderLeft: '2px solid #D2D8E0' }} />
				</>}
			>
				<div className='flex gap-2 flex-wrap mt-3' >{tags && tags.length>0 && <>{ tags?.map((tag,index) =>
					(<div key={index} className='rounded-xl border-solid border-[1px] border-[#D2D8E0] dark:border-separatorDark px-4 py-1 font-normal text-xs text-lightBlue' >
						{tag}
					</div>))}
				</>}
				</div>
			</Modal>
		</>
	);
};

export default styled(GovernanceCard)`
.ant-progress.ant-progress-circle .ant-progress-text{
  display: none;
}
.ant-progress .ant-progress-inner:not(.ant-progress-circle-gradient) .ant-progress-circle-path{
  stroke: #FF3C5F;
}
.ant-progress-circle > circle:nth-child(3){
  stroke: #2ED47A !important;
}
.ant-progress .ant-progress-text{
  display: none;
}
.ant-progress.ant-progress-show-info .ant-progress-outer {
  margin-inline-end: 0px; 
  padding-inline-end: 0px;
}
.progress-rotate{
  transform: rotate(-87deg);
}
`;
