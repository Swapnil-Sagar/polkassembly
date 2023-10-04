// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination as AntdPagination } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { getOnChainPosts, IPostsListingResponse } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useContext, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import Listing from '~src/components/Listing';
import { useNetworkContext } from '~src/context';
import { NetworkContext } from '~src/context/NetworkContext';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import FilterByTags from '~src/ui-components/FilterByTags';
import { ErrorState } from '~src/ui-components/UIStates';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import { isCreationOfTreasuryProposalSupported } from '~src/util/isCreationOfTreasuryProposalSupported';
import DiamondIcon from '~assets/icons/diamond-icon.svg';
import FilteredTags from '~src/ui-components/filteredTags';
<<<<<<< HEAD
import styled from 'styled-components';
import { useTheme } from 'next-themes';
=======
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TreasuryProposalFormButton = dynamic(() => import('src/components/CreateTreasuryProposal/TreasuryProposalFormButton'), {
	ssr: false
});

const TreasuryOverview = dynamic(() => import('src/components/Home/TreasuryOverview'), {
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { page = 1, sortBy = sortValues.NEWEST, filterBy } = query;
	const proposalType = ProposalType.TREASURY_PROPOSALS;
	const { data, error } = await getOnChainPosts({
		filterBy: filterBy && Array.isArray(JSON.parse(decodeURIComponent(String(filterBy)))) ? JSON.parse(decodeURIComponent(String(filterBy))) : [],
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalType,
		sortBy
	});
	return { props: { data, error, network } };
};

interface ITreasuryProps {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
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

const Treasury: FC<ITreasuryProps> = (props) => {
	const { data, error } = props;
	const { setNetwork } = useNetworkContext();
	const { resolvedTheme:theme } = useTheme();

	useEffect(() => {
		setNetwork(props.network);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const router = useRouter();

	const { network } = useContext(NetworkContext);

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return null;
	const { posts, count } = data;

	const onPaginationChange = (page: number) => {
		router.push({
			query: {
				page
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};

	return (
		<>
			<SEOHead
				title='Treasury Proposals'
				network={network}
			/>

<<<<<<< HEAD
			<div className='w-full flex flex-col sm:flex-row sm:items-center mt-3'>
				<h1 className='text-blue-light-high dark:text-blue-dark-high font-semibold text-2xl leading-9 mx-2 flex-1 mb-2 flex'><DiamondIcon className='mr-2 justify-self-center'/>Treasury Proposals ({count})</h1>
				{isCreationOfTreasuryProposalSupported(network) && <TreasuryProposalFormButton themes={theme}  />}
			</div>

			{/* Intro and Create Post Button */}
			<div className="mt-8">
				<p className="text-blue-light-high dark:text-blue-dark-high text-sm font-medium bg-white dark:bg-section-dark-overlay p-4 md:p-8 rounded-xxl w-full shadow-md mb-4">
					This is the place to discuss on-chain treasury proposals. On-chain posts are automatically generated as soon as they are created on the chain.
					Only the proposer is able to edit them.
					{
						['moonbeam', 'moonriver', 'moonbase'].includes(network)?
							<div>
								<a className='text-pink_primary' href='https://github.com/moonbeam-foundation/treasury/blob/main/interim/interim_treasury_proposal.md' target='_blank' rel="noreferrer" >Guidelines of the Interim Treasury.</a>
							</div>
							: null
					}
=======
			<div className='mt-3 flex w-full flex-col sm:flex-row sm:items-center'>
				<h1 className='mx-2 mb-2 flex flex-1 text-2xl font-semibold leading-9 text-bodyBlue'>
					<DiamondIcon className='mr-2 justify-self-center' />
					Treasury Proposals ({count})
				</h1>
				{isCreationOfTreasuryProposalSupported(network) && <TreasuryProposalFormButton />}
			</div>

			{/* Intro and Create Post Button */}
			<div className='mt-8'>
				<p className='mb-4 w-full rounded-xxl bg-white p-4 text-sm font-medium text-bodyBlue shadow-md md:p-8'>
					This is the place to discuss on-chain treasury proposals. On-chain posts are automatically generated as soon as they are created on the chain. Only the proposer is able
					to edit them.
					{['moonbeam', 'moonriver', 'moonbase'].includes(network) ? (
						<div>
							<a
								className='text-pink_primary'
								href='https://github.com/moonbeam-foundation/treasury/blob/main/interim/interim_treasury_proposal.md'
								target='_blank'
								rel='noreferrer'
							>
								Guidelines of the Interim Treasury.
							</a>
						</div>
					) : null}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				</p>
			</div>

			{/* Treasury Overview Cards */}
			<TreasuryOverview className='my-6' />

<<<<<<< HEAD
			<div className='shadow-md bg-white dark:bg-section-dark-overlay py-5 px-0 rounded-xxl'>
=======
			<div className='rounded-xxl bg-white px-0 py-5 shadow-md'>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				<div className='flex items-center justify-between'>
					<div className='mx-1 mt-3.5 sm:mx-12 sm:mt-3'>
						<FilteredTags />
					</div>
					<FilterByTags className='my-6 xs:mx-6 xs:my-2 sm:mr-14' />
				</div>

				<div>
<<<<<<< HEAD
					<Listing posts={posts}  proposalType={ProposalType.TREASURY_PROPOSALS} />
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
=======
					<Listing
						posts={posts}
						proposalType={ProposalType.TREASURY_PROPOSALS}
					/>
					<div className='mt-6 flex justify-end'>
						{!!count && count > 0 && count > LISTING_LIMIT && (
							<Pagination
								defaultCurrent={1}
								pageSize={LISTING_LIMIT}
								total={count}
								showSizeChanger={false}
								hideOnSinglePage={true}
								onChange={onPaginationChange}
								responsive={true}
							/>
						)}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					</div>
				</div>
			</div>
		</>
	);
};

export default Treasury;
