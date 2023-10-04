<<<<<<< HEAD
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React from 'react';
import { ProposalType, getFirestoreProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';

interface Props{
  timeline:any[];
  proposalType:ProposalType;
}
const LinkCard = ({ timeline, proposalType }: Props) => {

	return  <div className='bg-white dark:bg-section-dark-overlay drop-shadow-md rounded-md w-full mb-6 px-4 py-5'>
		{
			timeline?.map((item: any, index: number) => {
				const proposal_type = getFirestoreProposalType(item?.type);
				return (
					proposalType === proposal_type ?
						<span key={index}
							className='text-lg font-medium text-blue-light-high dark:text-blue-dark-high cursor-default max-md:text-sm'>
							<span className=''>{item?.type === 'ReferendumV2' ? 'Open Gov Referendum' : item?.type?.split(/(?=[A-Z])/).join(' ')}</span>
							<span className='text-blue-light-high dark:text-blue-dark-high mx-2'>#{item?.index}</span>
							<span className='mr-2'>{ index !== timeline.length - 1 && ' >> '}</span>
						</span> :
						<Link
							key={index}
							className='text-lg font-medium text-blue-light-high dark:text-blue-dark-high cursor-pointer max-md:text-sm'
							href={`/${getSinglePostLinkFromProposalType(proposal_type as any)}/${item?.type === 'Tip' ? item?.hash : item?.index}`}>
							<span  className=''>{item?.type === 'ReferendumV2' ? 'Open Gov Referendum' : item?.type?.split(/(?=[A-Z])/).join(' ')}</span>
							<span className='text-pink_primary mx-2'>#{item?.index}</span>
							<span className='mr-2'>{ index !== timeline.length - 1 && ' >> '}</span>
						</Link>
				);
			})
		}
	</div>;
};
export default LinkCard;
=======
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Link from 'next/link';
import React from 'react';
import { ProposalType, getFirestoreProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';

interface Props {
	timeline: any[];
	proposalType: ProposalType;
}
const LinkCard = ({ timeline, proposalType }: Props) => {
	return (
		<div className='mb-6 w-full rounded-md bg-white px-4 py-5 drop-shadow-md'>
			{timeline?.map((item: any, index: number) => {
				const firestoreProposalType = getFirestoreProposalType(item?.type);
				return proposalType === firestoreProposalType ? (
					<span
						key={index}
						className='cursor-default text-lg font-medium text-bodyBlue max-md:text-sm'
					>
						<span className=''>{item?.type === 'ReferendumV2' ? 'Open Gov Referendum' : item?.type?.split(/(?=[A-Z])/).join(' ')}</span>
						<span className='mx-2 text-bodyBlue'>#{item?.index}</span>
						<span className='mr-2'>{index !== timeline.length - 1 && ' >> '}</span>
					</span>
				) : (
					<Link
						key={index}
						className='cursor-pointer text-lg font-medium text-bodyBlue max-md:text-sm'
						href={`/${getSinglePostLinkFromProposalType(firestoreProposalType as any)}/${item?.type === 'Tip' ? item?.hash : item?.index}`}
					>
						<span className=''>{item?.type === 'ReferendumV2' ? 'Open Gov Referendum' : item?.type?.split(/(?=[A-Z])/).join(' ')}</span>
						<span className='mx-2 text-pink_primary'>#{item?.index}</span>
						<span className='mr-2'>{index !== timeline.length - 1 && ' >> '}</span>
					</Link>
				);
			})}
		</div>
	);
};
export default LinkCard;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
