// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAllowSetIdentity } from '../types';

const allowSetIdentity = ({ identityInfo, displayName, email, legalName, twitter }: IAllowSetIdentity) => {
	const condition = displayName === identityInfo?.displayName && email?.value.toLowerCase() === identityInfo?.email.toLowerCase() && legalName === identityInfo?.legalName;

	if (identityInfo.twitter?.length || twitter.value?.length) {
		return twitter.value.toLowerCase() === identityInfo?.twitter.toLowerCase() && condition;
	}
	return condition;
};
export default allowSetIdentity;
