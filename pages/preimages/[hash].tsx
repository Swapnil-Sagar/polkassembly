// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { IPreimageData, getLatestPreimage } from 'pages/api/v1/preimages/latest';
import React, { FC, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import { ErrorState } from '~src/ui-components/UIStates';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

const PreImagesTable = dynamic(() => import('~src/components/PreImagesTable'), {
	loading: () => <Skeleton active />,
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { hash = '' } = query;
	const network = getNetworkFromReqHeaders(req.headers);

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
	const { setNetwork } = useNetworkContext();

	useEffect(() => {
		setNetwork(props.network);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return null;

	return (
		<>
			<SEOHead
				title='PreImages'
				network={network}
			/>
			<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue'>Preimage</h1>

			{/* <div className="mt-8 mx-1">
				<PreImagesTable tableData={tableData} />
			</div> */}

			<div className='rounded-xxl bg-white p-3 shadow-md md:p-8'>
				<div>
					<PreImagesTable preimages={[data]} />
				</div>
			</div>
		</>
	);
};

export default PreImages;
