// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Post from 'src/components/Post/Post';
import BackToListingView from 'src/ui-components/BackToListingView';
import { ErrorState } from 'src/ui-components/UIStates';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import { noTitle } from '~src/global/noTitle';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

const proposalType = ProposalType.OPEN_GOV;
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { id } = query;

	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { data, error, status } = await getOnChainPost({
		network,
		postId: id,
		proposalType
	});
	return { props: { error, network, post: data, status } };
};

interface IReferendaPostProps {
	post: IPostResponse;
	error?: string;
	network: string;
	status?: number;
}

const ReferendaPost: FC<IReferendaPostProps> = (props) => {
	const { post, error, network } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;

	if (post) {
		let trackName = '';
		for (const key of Object.keys(networkTrackInfo[props.network])) {
			if (networkTrackInfo[props.network][key].trackId == post.track_number && !('fellowshipOrigin' in networkTrackInfo[props.network][key])) {
				trackName = key;
			}
		}
		return (
			<>
				<SEOHead
					title={post.title || `${noTitle} - Referenda V2`}
					desc={post.content}
					network={network}
				/>

				{trackName && <BackToListingView trackName={trackName} />}

				<div className='mt-6'>
					<Post
						post={post}
						trackName={trackName === 'Root' ? 'root' : trackName}
						proposalType={proposalType}
					/>
				</div>
			</>
		);
	}

	return (
		<div className='mt-16'>
			<LoadingState />
		</div>
	);
};

export default memo(ReferendaPost);
