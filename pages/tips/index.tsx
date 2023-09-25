// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Pagination as AntdPagination } from 'antd';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import Listing from '~src/components/Listing';
import { useNetworkContext } from '~src/context';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import FilterByTags from '~src/ui-components/FilterByTags';
import FilteredTags from '~src/ui-components/filteredTags';
import { ErrorState } from '~src/ui-components/UIStates';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import TipIcon from '~assets/icons/tip-icon.svg';

import styled from 'styled-components';
import { useTheme } from 'next-themes';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { page = 1, sortBy = sortValues.NEWEST, filterBy } = query;
	const proposalType = ProposalType.TIPS;
	const network = getNetworkFromReqHeaders(req.headers);
	const { data, error } = await getOnChainPosts({
		filterBy:filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy))))? JSON.parse(decodeURIComponent(String(filterBy))): [],
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalType,
		sortBy
	});
	return { props: { data, error, network, page } };
};

interface ITipsProps {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
	page: number;
}

const Pagination = styled(AntdPagination)`
	a{
		color: ${props => props.theme === 'dark' ? '#fff' : '#212121'} !important;
	}
	.ant-pagination-item-active {
		background-color: ${props => props.theme === 'dark' ? 'black' : 'white'} !important;
	}
	.anticon-right {
		color: ${props => props.theme === 'dark' ? 'white' : ''} !important;
	}
	.anticon-left {
		color: ${props => props.theme === 'dark' ? 'white' : ''} !important;
	}
`;

const Tips: FC<ITipsProps> = (props) => {
	const { data, error, page, network } = props;
	const { setNetwork } = useNetworkContext();
	const { resolvedTheme:theme } = useTheme();

	useEffect(() => {
		setNetwork(props.network);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return null;
	const { posts, count } = data;

	const onPaginationChange = (page:number) => {
		router.push({
			query:{
				page
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};

	return (
		<>
			<SEOHead title='Tips' network={network}/>
			<div className='flex items-center mt-3'>
				<TipIcon className='-mt-3.5'/>
				<h1 className='text-blue-light-high dark:text-blue-dark-high font-semibold text-2xl leading-9 mx-2'>On Chain Tips ({count})</h1>
			</div>

			{/* Intro and Create Post Button */}
			<div className="flex flex-col md:flex-row">
				<p className="text-blue-light-high dark:text-blue-dark-high text-sm font-medium bg-white dark:bg-section-dark-overlay p-4 md:p-8 rounded-xxl w-full shadow-md mb-4">
					This is the place to discuss on-chain tips. Tip posts are automatically generated as soon as they are created on-chain.
					Only the proposer is able to edit them.
				</p>
			</div>

			<div className='shadow-md bg-white dark:bg-section-dark-overlay py-5 px-0 rounded-xxl mt-6'>
				<div className='flex items-center justify-between'>
					<div className='mt-3.5 mx-1 sm:mt-3 sm:mx-12'>
						<FilteredTags/>
					</div>
					<FilterByTags className='my-6 sm:mr-14 xs:mx-6 xs:my-2'/>
				</div>

				<div>
					<Listing tipStartedIndex={count - 1 - (LISTING_LIMIT * (page - 1))} posts={posts} proposalType={ProposalType.TIPS} isTip={true} />
					<div className='flex justify-end mt-6'>
						{
							!!count && count > 0 && count > LISTING_LIMIT &&
						<Pagination
							theme={theme}
							defaultCurrent={1}
							pageSize={LISTING_LIMIT}
							total={count}
							showSizeChanger={false}
							hideOnSinglePage={true}
							onChange={onPaginationChange}
							responsive={true}
						/>
						}
					</div>
				</div>
			</div>
		</>
	);
};

export default Tips;