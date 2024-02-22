// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import { ErrorState, PostEmptyState } from 'src/ui-components/UIStates';

import MembersListing from './MembersListing';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import EmptyStateLight from '~assets/emptyStateLightMode.svg';
import EmptyStateDark from '~assets/emptyStateDarkMode.svg';
import { useTheme } from 'next-themes';

const MembersContainer = ({ className }: { className?: string }) => {
	const { api, apiReady } = useContext(ApiContext);
	const [error, setErr] = useState<Error | null>(null);
	const [members, setMembers] = useState<string[]>([]);
	const [runnersUp, setRunnersup] = useState<string[]>([]);
	const [prime, setPrime] = useState<string>('');
	const { resolvedTheme: theme } = useTheme();

	const [noCouncil, setNoCouncil] = useState(false);

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}

		if (!api.query?.council?.members) {
			setNoCouncil(true);
			return;
		}

		api.query?.council
			?.prime()
			.then((primeId) => {
				setPrime(primeId.unwrapOr('').toString());
			})
			.catch((error) => setErr(error));

		api.query?.council
			?.members()
			.then((members) => {
				setMembers(members.map((member) => member.toString()));
			})
			.catch((error) => setErr(error));

		if (!api.derive) {
			setRunnersup([]);
			return;
		}

		api.derive?.elections
			?.info()
			.then((electionInfo) => {
				setRunnersup(electionInfo.runnersUp.map((runner) => runner.toString().split(',')[0]));
			})
			.catch((error) => setErr(error));
	}, [api, apiReady]);

	if (error) {
		return <ErrorState errorMessage={error.message} />;
	}

	if (noCouncil || !members.length) {
		return (
			<PostEmptyState
				className='mt-8'
				image={theme === 'dark' ? <EmptyStateDark style={{ transform: 'scale(0.8' }} /> : <EmptyStateLight style={{ transform: 'scale(0.8' }} />}
				imageStyle={{ height: 260 }}
				description={
					<div className='p-5'>
						<b className='my-4 text-xl'>Waiting for Block Confirmation</b>
						<p>Usually its done within a few seconds</p>
					</div>
				}
			/>
		);
	}

	if (members.length || runnersUp.length) {
		return (
			<>
				<div className={`${className} rounded-md bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8`}>
					<div className='flex items-center justify-between'>
						<h1 className='dashboard-heading dark:text-white'>Members</h1>
					</div>

					<MembersListing
						className='mt-6'
						data={members}
						prime={prime}
					/>
				</div>

				<div className={`${className} rounded-md bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8`}>
					<div className='flex items-center justify-between'>
						<h1 className='dashboard-heading dark:text-white'>Runners up</h1>
					</div>

					<MembersListing
						className='mt-6'
						data={runnersUp}
						prime={prime}
					/>
				</div>
			</>
		);
	}

	return (
		<div className={className}>
			<LoadingState />
		</div>
	);
};

export default MembersContainer;
