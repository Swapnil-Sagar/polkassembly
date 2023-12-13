// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, message } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import ImageComponent from '~src/components/ImageComponent';
import CopyIcon from '~assets/icons/content_copy_small.svg';
import WhiteCopyIcon from '~assets/icons/content_copy_small_white.svg';
import copyToClipboard from '~src/util/copyToClipboard';
import EvalutionSummary from '../../PostSummary/EvalutionSummary';
import MessageIcon from '~assets/icons/ChatIcon.svg';
import ClipBoardIcon from '~assets/icons/ClipboardText.svg';
import CalenderIcon from '~assets/icons/Calendar.svg';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import Address from '~src/ui-components/Address';
import userProfileBalances from '~src/util/userProfieBalances';
import { useApiContext } from '~src/context';
import { useNetworkSelector } from '~src/redux/selectors';
import BN from 'bn.js';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import styled from 'styled-components';

const ZERO_BN = new BN(0);
interface IUserInfo {
	className?: string;
	address?: any;
	profileData?: any;
	isGood?: any;
}

const UserInfo: FC<IUserInfo> = (props) => {
	const { className, address, profileData } = props;
	const [transferableBalance, setTransferableBalance] = useState<BN>(ZERO_BN);
	const [proposalCount, setProposalCount] = useState(0);
	const [discussionCount, setDiscussionCount] = useState(0);

	const [messageApi, contextHolder] = message.useMessage();
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const unit = chainProperties[network]?.tokenSymbol;

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			const balances = await userProfileBalances({ address, api, apiReady, network });
			setTransferableBalance(balances?.transferableBalance || ZERO_BN);
			console.log(balances, transferableBalance);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	const fetchData = async () => {
		const { data, error } = await nextApiClientFetch<any>('/api/v1/posts/user-total-post-counts', {
			network: network,
			userId: profileData?.user_id
		});
		if (data) {
			setProposalCount(data?.proposals);
			setDiscussionCount(data?.discussions);
		} else {
			console.log(error);
		}
	};

	return (
		<div className={`${className}`}>
			<div className='flex gap-x-4'>
				<div className='h-[60px] w-[60px]'>
					<ImageComponent
						src={profileData?.profile?.image}
						alt='User Picture'
						className='flex h-[60px] w-[60px] items-center justify-center bg-transparent'
						iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
					/>
				</div>
				<div>
					<div className='flex gap-x-1'>
						<Address
							address={address}
							disableIdenticon={true}
							isUsedInDisplayData={true}
						/>
						<span
							className='-ml-2 -mt-0.5 flex cursor-pointer items-center'
							onClick={(e) => {
								e.preventDefault();
								copyToClipboard(address);
								success();
							}}
						>
							{contextHolder}
							{theme === 'dark' ? <WhiteCopyIcon className='ml-2 scale-125' /> : <CopyIcon className='ml-2 scale-125' />}
						</span>
					</div>
					{profileData?.profile?.bio ? (
						<div className='mt-3'>
							<p className='m-0 p-0 text-sm text-textGreyColor'>{profileData?.profile?.bio}</p>
						</div>
					) : (
						<div className='mt-3'>
							<p className='m-0 p-0 text-sm text-textGreyColor dark:text-lightGreyTextColor'>No bio added</p>
						</div>
					)}
					<div className='mt-3'>
						<EvalutionSummary isUsedInEvaluationTab={true} />
					</div>
					{profileData?.profile?.badges && profileData?.profile?.badges?.length > 0 && (
						<div className='mt-3'>
							<div className='flex gap-x-2'>
								{profileData?.profile?.badges.map((badge: string, index: number) => (
									<div
										className='border-grey_stroke flex border px-3.5 py-0.5 text-[12px] text-lightBlue hover:border-pink_primary hover:text-pink_primary dark:text-[#D2D8E0]'
										style={{ border: '1px solid #D2D8E0', borderRadius: '50px' }}
										key={index}
									>
										{badge}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
			<Divider
				style={{ background: '#D2D8E0', flexGrow: 1 }}
				className='mb-0 mt-2 dark:bg-separatorDark'
			/>
			<div className='user-info-container mt-4 flex h-[60px] items-center justify-between'>
				{profileData?.created_at && (
					<div className='info-container creation-date-container flex gap-x-2 py-4'>
						<CalenderIcon className='icon-container' />
						<div className='content-container -mt-1'>
							<p className='m-0 whitespace-nowrap p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Account Since</p>
							<span className='m-0 whitespace-nowrap p-0 text-sm font-semibold text-bodyBlue dark:text-white'>
								{dayjs(profileData?.created_at as string).format('DD MMM YYYY')}
							</span>
						</div>
					</div>
				)}
				{profileData?.created_at && (
					<Divider
						type='vertical'
						style={{ background: '#D2D8E0' }}
						className='divider-container h-[40px] dark:bg-separatorDark'
					/>
				)}
				<div className='info-container flex justify-center gap-x-2 py-4'>
					<ClipBoardIcon className='icon-container' />
					<div className='content-container -mt-1'>
						<p className='m-0 p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Proposals</p>
						<span className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{proposalCount < 10 ? `0${proposalCount}` : `${proposalCount}`}</span>
					</div>
				</div>
				<Divider
					type='vertical'
					style={{ background: '#D2D8E0' }}
					className='h-[40px] dark:bg-separatorDark'
				/>
				<div className='info-container flex justify-center gap-x-2 py-4'>
					<MessageIcon className='icon-container' />
					<div className='content-container -mt-1'>
						<p className='m-0 p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Discussions</p>
						<span className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{discussionCount < 10 ? `0${discussionCount}` : `${discussionCount}`}</span>
					</div>
				</div>
				<Divider
					type='vertical'
					style={{ background: '#D2D8E0' }}
					className='hide-div h-[40px] dark:bg-separatorDark'
				/>
				<div className='hide-div flex justify-end gap-x-2 py-4'>
					<MessageIcon className='icon-container' />
					<div className='content-container -mt-1'>
						<p className='m-0 p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Voting Power</p>
						<span className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>
							{formatedBalance((transferableBalance.toString() || '0').toString(), unit, 2)} {unit}
						</span>
					</div>
				</div>
			</div>
			{/* <div className='user-info-container-mweb mt-4 flex h-[60px] items-center justify-between'>
				<div className={`flex ${profileData?.created_at ? 'justify-center' : 'justify-between'}`}>
					{!profileData?.created_at && (
						<div className='flex justify-start gap-x-0.5 py-2'>
							<CalenderIcon className='icon-container scale-90' />
							<div className='data-container -mt-1'>
								<p className='heading-container m-0 p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Account Since</p>
								<span className='value-container m-0 p-0 text-[12px] font-semibold text-bodyBlue dark:text-white'>
									{dayjs(profileData?.created_at as string).format('DD MMM YYYY')}
								</span>
							</div>
						</div>
					)}
					{!profileData?.created_at && (
						<Divider
							type='vertical'
							style={{ background: '#D2D8E0' }}
							className='h-[40px] dark:bg-separatorDark'
						/>
					)}
					<div className='flex justify-center gap-x-0.5 py-2'>
						<ClipBoardIcon className='icon-container scale-90' />
						<div className='data-container -mt-1'>
							<p className='heading-container m-0 p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Proposals</p>
							<span className='value-container m-0 p-0 text-[12px] font-semibold text-bodyBlue dark:text-white'>
								{proposalCount < 10 ? `0${proposalCount}` : `${proposalCount}`}
							</span>
						</div>
					</div>
					<Divider
						type='vertical'
						style={{ background: '#D2D8E0' }}
						className='h-[40px] dark:bg-separatorDark'
					/>
					<div className='flex justify-end gap-x-0.5 py-2'>
						<MessageIcon className='icon-container scale-90' />
						<div className='data-container -mt-1'>
							<p className='heading-container m-0 p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Discussions</p>
							<span className='value-container m-0 p-0 text-[12px] font-semibold text-bodyBlue dark:text-white'>
								{discussionCount < 10 ? `0${discussionCount}` : `${discussionCount}`}
							</span>
						</div>
					</div>
				</div>
			</div> */}
		</div>
	);
};

export default styled(UserInfo)`
	@media (max-width: 540px) and (min-width: 319px) {
		.hide-div {
			display: none !important;
		}
	}
	@media (max-width: 420px) and (min-width: 392px) {
		.icon-container {
			transform: scale(0.8);
		}
		.content-container {
			margin-top: 0px !important;
		}
		.info-container {
			gap: 0 2px !important;
		}
	}
	@media (max-width: 390px) and (min-width: 319px) {
		.creation-date-container {
			display: none !important;
		}
		.divider-container {
			display: none !important;
		}
	}
`;