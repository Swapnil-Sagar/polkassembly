// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import React, { FC, useEffect } from 'react';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import { TermsAndConditions } from '~src/components/LegalDocuments';
import { useDispatch } from 'react-redux';
import { networkActions } from '~src/redux/network';
import SEOHead from '~src/global/SEOHead';

interface ITermsAndConditionsPage {
	network: string;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	return {
		props: {
			network
		}
	};
};

const TermsAndConditionsPage: FC<ITermsAndConditionsPage> = (props) => {
	const { network } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(networkActions.setNetwork(props.network));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<SEOHead title='Terms and Conditions' network={network} />
			<TermsAndConditions/>
		</>
	);
};

export default TermsAndConditionsPage;