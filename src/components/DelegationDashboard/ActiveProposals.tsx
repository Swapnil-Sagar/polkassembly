// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ActiveProposalsIcon from '~assets/icons/active-proposals.svg';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { IPostListing } from 'pages/api/v1/listing/on-chain-posts';
import dynamic from 'next/dynamic';
import { Empty, Skeleton } from 'antd';
import { ETrackDelegationStatus } from '~src/types';

interface Props {
	className?: string;
	posts: IPostListing[];
	trackDetails: any;
	status: ETrackDelegationStatus[];
	delegatedTo: string | null;
}

const ActiveProposalCard = dynamic(() => import('./ActiveProposalCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const ActiveProposals = ({ className, posts, trackDetails, status, delegatedTo }: Props) => {
	const count = posts.length;
	const [expandProposals, setExpandProposals] = useState<boolean>(false);

	return (
		<div className={`${className} mt-[22px] rounded-[14px] bg-white px-[37px] py-[24px]`}>
			<div
				onClick={() => setExpandProposals(!expandProposals)}
				className=' shadow-[0px 4px 6px rgba(0, 0, 0, 0.08] flex cursor-pointer items-center justify-between'
			>
				<div className='jutify-center flex items-center gap-2'>
					<ActiveProposalsIcon className='mr-[4px]' />
					<span className='text-[24px] font-semibold tracking-[0.0015em] text-[#243A57]'>Active Proposals</span>
					<span className='flex h-[34px] items-center justify-center rounded-[26px] bg-[#D2D8E04D] px-3 py-[6px] font-semibold text-[#243A57]'>
						{count < 10 && count !== 0 && 0}
						{count}
					</span>
				</div>
				<div className='cursor-pointer p-2'>{!expandProposals ? <ExpandIcon /> : <CollapseIcon />}</div>
			</div>
			{expandProposals && (
				<div className='mt-[24px] flex flex-col gap-6'>
					{posts?.length > 0 ? (
						posts?.map((proposal, index) => (
							<ActiveProposalCard
								proposal={proposal}
								key={index}
								trackDetails={trackDetails}
								status={status}
								delegatedTo={delegatedTo}
							/>
						))
					) : (
						<Empty className='mb-4' />
					)}
				</div>
			)}
		</div>
	);
};
export default ActiveProposals;
