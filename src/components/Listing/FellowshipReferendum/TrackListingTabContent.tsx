// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { poppins } from 'pages/_app';
import React, { FC } from 'react';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import { ErrorState, PostEmptyState } from 'src/ui-components/UIStates';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import EmptyStateLight from '~assets/emptyStateLightMode.svg';
import EmptyStateDark from '~assets/emptyStateDarkMode.svg';
import { useTheme } from 'next-themes';

const GovernanceCard = dynamic(() => import('~src/components/GovernanceCard'), {
	loading: () => <Skeleton active />,
	ssr: false
});

interface ITrackListingTabContentProps {
	className?: string;
	posts: any[];
	error?: any;
	count?: number;
}

const TrackListingTabContent: FC<ITrackListingTabContentProps> = (props) => {
	const { className, posts, error, count } = props;
	const { resolvedTheme: theme } = useTheme();

	if (error) return <ErrorState errorMessage={error} />;

	if (error)
		return (
			<div className={className}>
				<ErrorAlert errorMsg={error} />
			</div>
		);

	const noPosts = count === 0 || isNaN(Number(count));

	if (noPosts)
		return (
			<div className={className}>
				<PostEmptyState
					image={theme === 'dark' ? <EmptyStateDark style={{ transform: 'scale(0.8)' }} /> : <EmptyStateLight style={{ transform: 'scale(0.8)' }} />}
					imageStyle={{ height: 260 }}
				/>
			</div>
		);

	if (posts && posts.length > 0)
		return (
			<div className={className}>
				{posts.map((post, index) => {
					return (
						<div
							key={post.post_id}
							className='my-0'
						>
							{
								<Link href={`/member-referenda/${post.post_id}`}>
									<GovernanceCard
										className={`${(index + 1) % 2 !== 0 && 'bg-[#FBFBFC] dark:bg-[#161616]'} ${poppins.variable} ${poppins.className}`}
										postReactionCount={post.post_reactions}
										address={post.proposer}
										commentsCount={post.comments_count || 0}
										method={post.method}
										onchainId={post.post_id}
										status={post.status}
										title={post.title}
										topic={post.topic?.name}
										created_at={post.created_at}
										tags={post?.tags}
										spam_users_count={post?.spam_users_count}
										tally={post?.tally}
										timeline={post?.timeline || []}
										statusHistory={post?.status_history || []}
										index={index}
										proposalType={post?.type}
										trackNumber={post?.track_no}
									/>
								</Link>
							}
						</div>
					);
				})}
			</div>
		);

	return (
		<div className='mt-12'>
			<LoadingState />
		</div>
	);
};

export default TrackListingTabContent;
