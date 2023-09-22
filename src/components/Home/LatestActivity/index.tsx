// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tabs } from 'antd';
import Link from 'next/link';
import { ILatestActivityPosts } from 'pages';
import { ILatestActivityPostsListingResponse } from 'pages/api/v1/latest-activity/on-chain-posts';
import React, { FC, useState } from 'react';
import CountBadgePill from 'src/ui-components/CountBadgePill';
import styled from 'styled-components';

import { ProposalType } from '~src/global/proposalType';
import { IApiResponse } from '~src/types';

import { getColumns } from './columns';
import PostsTable from './PostsTable';

interface ILatestActivityProps {
	latestPosts: {
		all?: IApiResponse<ILatestActivityPostsListingResponse>;
	} & ILatestActivityPosts;
	className?: string;
}
type TCapitalizeFn = (str: string, lower?: boolean) => string;
const capitalize: TCapitalizeFn = (str, lower = false) => (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());

const getLabel = (key: 'all' | ProposalType): string => {
	if (key === ProposalType.COUNCIL_MOTIONS) {
		return 'Motions';
	} else if (key === ProposalType.DEMOCRACY_PROPOSALS) {
		return 'Proposals';
	} else if (key === ProposalType.TREASURY_PROPOSALS) {
		return 'Treasury Proposals';
	} else if (key === ProposalType.TECHNICAL_PIPS) {
		return 'Technical';
	} else if (key === ProposalType.UPGRADE_PIPS) {
		return 'Upgrade';
	} else if (key === ProposalType.COMMUNITY_PIPS) {
		return 'Community';
	}
	return capitalize(key);
};

const LatestActivity: FC<ILatestActivityProps> = ({ className, latestPosts }) => {
	const [currentTab, setCurrentTab] = useState('all');
	const tabItems = (Object.entries(latestPosts) as [key: 'all' | ProposalType, value: IApiResponse<ILatestActivityPostsListingResponse>][]).map(([key, value]) => {
		const label = getLabel(key);
		return {
			children: (
				<PostsTable
					count={value?.data?.count || 0}
					posts={value?.data?.posts}
					error={value?.error || ''}
					columns={getColumns(key)}
					type={key}
				/>
			),
			key: key === ProposalType.REFERENDUMS ? 'referenda' : label.toLowerCase().split(' ').join('-'),
			label: (
				<CountBadgePill
					label={label}
					count={value?.data?.count}
				/>
			)
		};
	});

	return (
		<div className={`${className} rounded-xxl bg-white p-0 drop-shadow-md lg:p-6`}>
			<div className='flex items-center justify-between pl-1 pr-4'>
				<h2 className='mx-3.5 mb-6 mt-6 text-xl font-medium leading-8 text-bodyBlue lg:mx-0 lg:mt-0'>Latest Activity</h2>
				{currentTab !== 'all' && (
					<Link
						className='rounded-lg px-2 font-medium text-bodyBlue hover:text-pink_primary'
						href={`/${currentTab}`}
					>
						View all
					</Link>
				)}
			</div>
			<Tabs
				className='ant-tabs-tab-bg-white text-sm font-medium text-bodyBlue md:px-2'
				type='card'
				items={tabItems}
				onChange={(key) => setCurrentTab(key)}
			/>
		</div>
	);
};

export default styled(LatestActivity)`
	th {
		color: #485f7d !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
	}

	th.ant-table-cell {
		color: #485f7d !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
	}

	.ant-table-thead > tr > th {
		color: #485f7d !important;
		font-weight: 500 !important;
		font-size: 14px !important;
		line-height: 21px !important;
	}

	.ant-table-row {
		color: #243a57 !important;
		font-size: 14px !important;
		font-weight: 400 !important;
	}

	tr {
		color: #243a57 !important;
		font-size: 14px !important;
		font-weight: 400 !important;
		cursor: pointer !important;
	}

	.ant-tabs-tab-bg-white .ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: white;
		border-top-color: white;
		border-left-color: white;
		border-right-color: white;
		border-bottom-color: #e1e6eb;
	}

	.ant-tabs-tab-bg-white .ant-tabs-tab-active {
		border-top-color: #e1e6eb;
		border-left-color: #e1e6eb;
		border-right-color: #e1e6eb;
		border-radius: 6px 6px 0 0 !important;
	}

	.ant-tabs-tab-bg-white .ant-tabs-nav:before {
		border-bottom: 1px solid #e1e6eb;
	}
`;
