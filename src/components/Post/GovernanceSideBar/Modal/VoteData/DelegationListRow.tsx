// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import Address from 'src/ui-components/Address';
import { VoteType } from '~src/global/proposalType';
import { network as AllNetworks } from '~src/global/networkConstants';
import { useNetworkContext } from '~src/context';
import { parseBalance } from './utils/parseBalaceToReadable';

interface IDelegationListRow {
	voteType: VoteType;
	voteData?: any;
}

const DelegationListRow: FC<IDelegationListRow> = ({ voteType, voteData }) => {
	const { network } = useNetworkContext();
	return (
		<div className='flex items-center text-xs text-bodyBlue'>
			{voteType === VoteType.REFERENDUM_V2 && voteData?.txnHash ? (
				<a
					href={`https://${network}.moonscan.io/tx/${voteData.txnHash}`}
					className='w-[200px] overflow-ellipsis text-bodyBlue'
				>
					<Address
						isVoterAddress={true}
						textClassName='w-[100px]'
						isSubVisible={false}
						displayInline={true}
						isShortenAddressLength={false}
						address={voteData?.voter}
					/>
				</a>
			) : (
				<div className='w-[200px] overflow-ellipsis text-bodyBlue'>
					<Address
						textClassName='w-[100px]'
						isSubVisible={false}
						displayInline={true}
						isShortenAddressLength={false}
						address={voteData?.voter}
					/>
				</div>
			)}

			{network !== AllNetworks.COLLECTIVES ? (
				<>
					<div className='w-[115px] overflow-ellipsis text-bodyBlue'>
						{parseBalance((voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0).toString(), 2, true, network)}
					</div>
					<div className='w-[110px] overflow-ellipsis text-bodyBlue'>{voteData.lockPeriod ? `${voteData.lockPeriod}x${voteData?.delegatedVotes?.length ? '/d' : ''}` : '0.1x'}</div>
				</>
			) : (
				<>
					<div className='w-[120px] overflow-ellipsis text-bodyBlue'>
						{parseBalance((voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0).toString(), 2, true, network)}
					</div>
				</>
			)}

			{voteData.votingPower && <div className='w-[80px] overflow-ellipsis text-bodyBlue'>{parseBalance(voteData.votingPower.toString(), 2, true, network)}</div>}
		</div>
	);
};

export default React.memo(DelegationListRow);
