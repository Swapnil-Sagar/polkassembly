// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

const CreatePost = dynamic(() => import('~src/components/Post/CreatePost'), {
	loading: () => (
		<div className='mb-4 mt-6 flex w-full flex-col rounded-md bg-white p-4 shadow-md md:p-8'>
			<Skeleton.Input active />
			<Skeleton.Input
				className='mt-8'
				active
			/>
			<Skeleton
				className='mt-8'
				active
			/>
			<Skeleton.Input
				className='mt-8'
				active
			/>
			<Skeleton.Button
				className='mt-8'
				active
			/>
		</div>
	),
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const Create = ({ network }: { network: string }) => {
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead
				title={'Create Post'}
				network={network}
			/>
			<CreatePost proposalType={ProposalType.DISCUSSIONS} />
		</>
	);
};

export default Create;
