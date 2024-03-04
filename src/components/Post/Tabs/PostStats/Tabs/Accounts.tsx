// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useState, useEffect } from 'react';
import TotalVotesCard from '../TotalVotesCard';
import VotesDelegationCard from '../VotesDelegationCard';
import VotesTurnoutCard from '../VotesTurnoutCard';
import TimeSplit from '../TimeSplit';
import VoteConvictions from '../VoteConvictions';
import VoteDelegationsByConviction from '../VoteDelegationsByConviction';
import BN from 'bn.js';
import { IAllVotesType } from 'pages/api/v1/votes/total';
import { Divider } from 'antd';
import Nudge from './Nudge';

interface IVotesAccountProps {
	allVotes: IAllVotesType | undefined;
	totalVotesCount: any;
	activeIssuance: BN;
	totalIssuance: BN;
}
const Accounts = ({ allVotes, totalIssuance, totalVotesCount, activeIssuance }: IVotesAccountProps) => {
	const [delegatedVotesCount, setDelegatedVotesCount] = useState<number>(0);
	const [soloVotesCount, setSoloVotesCount] = useState<number>(0);
	const [votesByConviction, setVotesByConviction] = useState<any[]>([]);
	const [votesByDelegation, setVotesByDelegation] = useState<any[]>([]);
	const [votesByTimeSplit, setVotesByTimeSplit] = useState<any[]>([]);

	useEffect(() => {
		if (!allVotes?.data) return;

		const votesByConviction = allVotes?.data.reduce(
			(acc, vote) => {
				const conviction = vote.lockPeriod.toString();
				if (!acc[conviction]) {
					acc[conviction] = {
						abstain: 0,
						no: 0,
						yes: 0
					};
				}
				acc[conviction][vote.decision]++;
				return acc;
			},
			{} as { [key: string]: { yes: number; no: number; abstain: number } }
		);

		const votesByDelegation = allVotes?.data.reduce(
			(acc, vote) => {
				const conviction = vote.lockPeriod.toString();
				const delegation = vote.isDelegatedVote ? 'delegated' : 'solo';
				if (!acc[conviction]) {
					acc[conviction] = {
						delegated: 0,
						solo: 0
					};
				}
				acc[conviction][delegation]++;
				return acc;
			},
			{} as { [key: string]: { delegated: number; solo: number } }
		);

		const votesByTimeSplit = allVotes?.data.reduce(
			(acc, vote) => {
				const proposalCreatedAt = new Date(vote.proposal.createdAt);
				const voteCreatedAt = new Date(vote.createdAt);
				const timeSplit = Math.floor((voteCreatedAt.getTime() - proposalCreatedAt.getTime()) / (24 * 60 * 60 * 1000));

				if (timeSplit == 0) {
					acc[0] = acc[0] ? acc[0] + 1 : 1;
				} else if (timeSplit <= 7) {
					acc[7] = acc[7] ? acc[7] + 1 : 1;
				} else if (timeSplit <= 10) {
					acc[10] = acc[10] ? acc[10] + 1 : 1;
				} else if (timeSplit <= 14) {
					acc[14] = acc[14] ? acc[14] + 1 : 1;
				} else if (timeSplit <= 20) {
					acc[20] = acc[20] ? acc[20] + 1 : 1;
				} else if (timeSplit <= 24) {
					acc[24] = acc[24] ? acc[24] + 1 : 1;
				} else if (timeSplit <= 28) {
					acc[28] = acc[28] ? acc[28] + 1 : 1;
				} else {
					acc[timeSplit] = acc[timeSplit] ? acc[timeSplit] + 1 : 1;
				}
				return acc;
			},
			{} as { [key: number]: number }
		);

		const delegated = allVotes?.data.filter((vote) => vote.isDelegatedVote);

		setVotesByConviction(votesByConviction as any);
		setVotesByDelegation(votesByDelegation as any);
		setDelegatedVotesCount(delegated.length);
		setSoloVotesCount(allVotes?.data.length - delegated.length);
		setVotesByTimeSplit(votesByTimeSplit as any);
	}, [allVotes]);

	return (
		<>
			<Nudge text='Accounts is the number of unique addresses casting a vote' />
			<div className='flex flex-col gap-5'>
				<div className='flex flex-col items-center gap-5 md:flex-row'>
					<TotalVotesCard
						ayeValue={totalVotesCount.ayes}
						nayValue={totalVotesCount.nays}
						abstainValue={totalVotesCount.abstain}
						isUsedInAccounts={true}
					/>
					<VotesDelegationCard
						delegatedValue={delegatedVotesCount}
						soloValue={soloVotesCount}
						isUsedInAccounts={true}
					/>
					<VotesTurnoutCard
						activeIssuance={activeIssuance}
						totalIssuance={totalIssuance}
					/>
				</div>
				<TimeSplit
					votesByTimeSplit={votesByTimeSplit}
					isUsedInAccounts={true}
				/>
				<Divider
					dashed
					className='my-2 border-[#D2D8E0]'
				/>
				<div className='flex flex-col items-center gap-5 md:flex-row'>
					<VoteConvictions
						votesByConviction={votesByConviction}
						isUsedInAccounts={true}
					/>
					<VoteDelegationsByConviction
						votesByDelegation={votesByDelegation}
						isUsedInAccounts={true}
					/>
				</div>
			</div>
		</>
	);
};

export default Accounts;
