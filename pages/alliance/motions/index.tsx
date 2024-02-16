// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Pagination } from '~src/ui-components/Pagination';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getOnChainPosts } from 'pages/api/v1/listing/on-chain-posts';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import Listing from '~src/components/Listing';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { sortValues } from '~src/global/sortOptions';
import { setNetwork } from '~src/redux/network';
import { ErrorState } from '~src/ui-components/UIStates';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import { useTheme } from 'next-themes';
import { getSubdomain } from '~src/util/getSubdomain';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	let network = getNetworkFromReqHeaders(req.headers);
	const referer = req.headers.referer;

	let queryNetwork = null;
	if (referer) {
		try {
			const url = new URL(referer);
			queryNetwork = url.searchParams.get('network');
		} catch (error) {
			console.error('Invalid referer URL:', referer, error);
		}
	}
	if (queryNetwork) {
		network = queryNetwork;
	}
	if (query?.network) {
		network = query?.network as string;
	}

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { page = 1, sortBy = sortValues.NEWEST } = query;
	const proposalType = ProposalType.ALLIANCE_MOTION;
	const { data, error } = await getOnChainPosts({
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalType,
		sortBy
	});
	return { props: { data, error, network } };
};

interface IMotionsProps {
	data?: { posts: any[]; count: number };
	error?: string;
	network: string;
}
export const AllianceMotions: FC<IMotionsProps> = (props) => {
	const { data, error, network } = props;
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();

	const router = useRouter();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		const currentUrl = window ? window.location.href : '';
		const subDomain = getSubdomain(currentUrl);
		if (network && ![subDomain]?.includes(network)) {
			router.push({
				query: {
					network: network
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;

	if (!data) return null;

	const { posts, count } = data;
	const onPaginationChange = (page: number) => {
		router.push({
			query: {
				network: network,
				page
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};

	return (
		<>
			<SEOHead
				title='Alliance Motion'
				network={network}
			/>
			<h1 className='dashboard-heading mb-4 md:mb-6'>Alliance Motions</h1>
			<div className='flex flex-col md:flex-row'>
				<p className='mb-4 w-full rounded-md bg-white p-4 text-sm font-medium text-sidebarBlue shadow-md dark:bg-section-dark-overlay md:p-8 md:text-base'>
					This is the place to discuss on-chain motions. On-chain posts are automatically generated as soon as they are created on the chain. Only the proposer is able to edit
					them.
				</p>
			</div>
			<div className='rounded-md bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8'>
				<div className='flex items-center justify-between'>
					<h1 className='dashboard-heading'>{count} Motions</h1>
				</div>

				<div>
					<Listing
						posts={posts}
						proposalType={ProposalType.ALLIANCE_MOTION}
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
								theme={theme}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default AllianceMotions;
