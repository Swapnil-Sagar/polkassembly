// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { IPostsListingResponse, getOnChainPosts } from 'pages/api/v1/listing/on-chain-posts';
import { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import DashboardTrackListing from '~src/components/DelegationDashboard/DashboardTrack';
import { CustomStatus } from '~src/components/Listing/Tracks/TrackListingCard';
import SEOHead from '~src/global/SEOHead';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType } from '~src/global/proposalType';
import { sortValues } from '~src/global/sortOptions';
import { setNetwork } from '~src/redux/network';
import { ErrorState } from '~src/ui-components/UIStates';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import getQueryToTrack from '~src/util/getQueryToTrack';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { useNetworkSelector } from '~src/redux/selectors';
import { getSubdomain } from '~src/util/getSubdomain';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	let network = getNetworkFromReqHeaders(req.headers);
	const queryNetwork = new URL(req.headers.referer || '').searchParams.get('network');
	if (queryNetwork) {
		network = queryNetwork;
	}

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { page = 1, sortBy = sortValues.NEWEST, track } = query;
	const trackDetails: any = getQueryToTrack(String(track), network);

	const { data, error = '' } = await getOnChainPosts({
		listingLimit: LISTING_LIMIT,
		network,
		page,
		proposalType: ProposalType.OPEN_GOV,
		sortBy,
		trackNo: trackDetails?.trackId,
		trackStatus: CustomStatus.Active
	});

	return {
		props: {
			data,
			error,
			network,
			trackDetails
		}
	};
};

interface ITrackProps {
	data?: IPostsListingResponse;
	error?: string;
	network: string;
	trackDetails: any;
}

const DashboardTracks: FC<ITrackProps> = (props) => {
	const { data, error, trackDetails } = props;
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();

	const router = useRouter();
	const { network } = useNetworkSelector();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		const currentUrl = window.location.href;
		const subDomain = getSubdomain(currentUrl);
		if (network && ![subDomain].includes(network)) {
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

	return (
		<>
			<SEOHead
				title='Delegation Dashboard'
				network={props.network}
			/>
			<DashboardTrackListing
				posts={posts}
				trackDetails={trackDetails}
				theme={theme}
				totalCount={count}
			/>
		</>
	);
};
export default DashboardTracks;
