// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { IPreimageData, getLatestPreimage } from 'pages/api/v1/preimages/latest';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import Skeleton from '~src/basic-components/Skeleton';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { ErrorState } from '~src/ui-components/UIStates';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { getSubdomain } from '~src/util/getSubdomain';

const PreImagesTable = dynamic(() => import('~src/components/PreImagesTable'), {
	loading: () => <Skeleton active />,
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { hash = '' } = query;
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

	const { data, error } = await getLatestPreimage({ hash: String(hash), network });

	return { props: { data, error, network } };
};

interface IPreImagesProps {
	data?: IPreimageData;
	error?: string;
	network: string;
}

const PreImages: FC<IPreImagesProps> = (props) => {
	const { data, error, network } = props;
	const dispatch = useDispatch();
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();

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

	return (
		<>
			<SEOHead
				title='PreImages'
				desc='Discover more about preimages of on chain governance proposals on Polkassembly'
				network={network}
			/>
			<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>Preimage</h1>

			{/* <div className="mt-8 mx-1">
				<PreImagesTable tableData={tableData} />
			</div> */}

			<div className='rounded-xxl bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8'>
				<div>
					<PreImagesTable
						preimages={[data]}
						theme={theme}
					/>
				</div>
			</div>
		</>
	);
};

export default PreImages;
