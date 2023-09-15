// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Form, Input, Radio, Switch } from 'antd';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import ContentForm from 'src/components/ContentForm';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import { PostCategory } from 'src/global/post_categories';
import { usePollEndBlock } from 'src/hooks';
import { NotificationStatus } from 'src/types';
import BackToListingView from 'src/ui-components/BackToListingView';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import queueNotification from 'src/ui-components/QueueNotification';
import styled from 'styled-components';

import { ChangeResponseType, CreatePostResponseType } from '~src/auth/types';
import POLL_TYPE from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import TopicsRadio from './TopicsRadio';
import AddTags from '~src/ui-components/AddTags';

interface Props {
	className?: string;
	proposalType: ProposalType;
}

const CreatePost = ({ className, proposalType }: Props) => {
	const router = useRouter();
	const currentUser = useContext(UserDetailsContext);

	const [form] = Form.useForm();
	const pollEndBlock = usePollEndBlock();
	const [topicId, setTopicId] = useState<number>(2);
	const [hasPoll, setHasPoll] = useState<boolean>(false);
	const [formDisabled, setFormDisabled] = useState<boolean>(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [govType, setGovType] = useState<'gov_1' | 'open_gov'>('gov_1');
	const [tags, setTags] = useState<string[]>([]);

	useEffect(() => {
		if (!currentUser?.id) {
			router.replace('/');
		}
	}, [currentUser?.id, router]);

	const createSubscription = async (postId: number) => {
		if (!currentUser.email_verified) return;

		const { data, error } = await nextApiClientFetch<ChangeResponseType>('api/v1/auth/actions/postSubscribe', { post_id: postId, proposalType });
		if (error) console.error('Error subscribing to post', error);
		if (data?.message) console.log(data.message);
	};

	const createPoll = async (postId: number) => {
		if (!hasPoll) return;

		if (!pollEndBlock) {
			queueNotification({
				header: 'Failed to get end block number. Poll creation failed!',
				message: 'Failed',
				status: NotificationStatus.ERROR
			});
			return;
		}

		const { error: apiError } = await nextApiClientFetch('api/v1/auth/actions/createPoll', {
			blockEnd: pollEndBlock,
			pollType: POLL_TYPE.NORMAL,
			postId,
			proposalType
		});

		if (apiError) {
			console.error('Error creating a poll', apiError);
			return;
		}
	};

	const handleSend = async () => {
		if (!currentUser.id || !topicId) return;

		try {
			await form.validateFields();
			// Validation is successful
			const content = form.getFieldValue('content');
			const title = form.getFieldValue('title');

			if (!title || !content) return;

			setFormDisabled(true);
			setLoading(true);

			const { data, error: apiError } = await nextApiClientFetch<CreatePostResponseType>('api/v1/auth/actions/createPost', {
				content,
				gov_type: govType,
				proposalType,
				tags,
				title,
				topicId,
				userId: currentUser.id
			});

			if (apiError || !data?.post_id) {
				setError(apiError || 'There was an error creating your post.');
				queueNotification({
					header: 'Error',
					message: 'There was an error creating your post.',
					status: NotificationStatus.ERROR
				});
				console.error(apiError);
			}

			if (data && data.post_id) {
				const postId = data.post_id;
				router.push(`/${proposalType === ProposalType.GRANTS ? 'grant' : 'post'}/${postId}`);
				queueNotification({
					header: 'Thanks for sharing!',
					message: 'Post created successfully.',
					status: NotificationStatus.SUCCESS
				});
				createSubscription(postId);
				createPoll(postId);
			}
			setFormDisabled(false);
			setLoading(false);
		} catch {
			//do nothing, await form.validateFields(); will automatically highlight the error ridden fields
		} finally {
			setFormDisabled(false);
		}
	};

	return (
		<div className={className}>
			<BackToListingView postCategory={proposalType === ProposalType.DISCUSSIONS ? PostCategory.DISCUSSION : PostCategory.GRANT} />

			<div className='mb-4 mt-6 flex w-full flex-col rounded-md bg-white p-4 shadow-md md:p-8'>
				<h2 className='dashboard-heading mb-8'>New Post</h2>
				{error && (
					<ErrorAlert
						errorMsg={error}
						className='mb-4'
					/>
				)}

				<Form
					form={form}
					name='create-post-form'
					onFinish={handleSend}
					layout='vertical'
					disabled={formDisabled || loading}
					validateMessages={{ required: "Please add the '${name}'" }}
				>
					<label className='mb-1 text-sm font-normal tracking-wide text-sidebarBlue'>
						Title<span className='ml-1 text-red-500'>*</span>
					</label>
					<Form.Item
						name='title'
						rules={[{ required: true }]}
					>
						<Input
							name='title'
							autoFocus
							placeholder='Enter Title'
							className='text-black'
						/>
					</Form.Item>
					<ContentForm />
					<div className='flex items-center'>
						<Switch
							size='small'
							onChange={(checked) => setHasPoll(checked)}
						/>
						<span className='ml-2 text-sm text-sidebarBlue'>Add poll to {proposalType === ProposalType.DISCUSSIONS ? 'discussion' : 'grant'}</span>
					</div>
					<h5 className='text-color mt-8 text-sm font-normal'>
						Select Governance version <span className='text-red-500'>*</span>
					</h5>
					<Radio.Group
						className='p-1 text-xs font-normal'
						onChange={(e) => setGovType(e.target.value)}
						value={govType}
					>
						<Radio
							className={`text-xs font-normal text-navBlue ${govType === 'gov_1' && 'text-pink_primary'}`}
							value='gov_1'
							defaultChecked
						>
							Governance V1
						</Radio>
						<Radio
							className={`text-xs font-normal text-navBlue ${govType === 'open_gov' && 'text-pink_primary'}`}
							value='open_gov'
							defaultChecked={false}
						>
							Governance V2
						</Radio>
					</Radio.Group>
					{proposalType === ProposalType.DISCUSSIONS ? (
						<Form.Item
							className='mt-8'
							name='topic'
							rules={[
								{
									message: "Please select a 'topic'",
									validator(rule, value = topicId, callback) {
										if (callback && !value) {
											callback(rule?.message?.toString());
										} else {
											callback();
										}
									}
								}
							]}
						>
							<>
								<label className='mb-1 text-sm font-normal tracking-wide text-sidebarBlue'>
									Select Topic <span className='ml-1 text-red-500'>*</span>
								</label>
								<TopicsRadio
									govType={govType}
									onTopicSelection={(id) => setTopicId(id)}
									topicId={topicId}
								/>
							</>
						</Form.Item>
					) : null}
					<h5 className='text-color mt-8 text-sm font-normal'>Add Tags</h5>
					<AddTags
						tags={tags}
						setTags={setTags}
					/>
					<Form.Item>
						<Button
							htmlType='submit'
							disabled={!currentUser.id || formDisabled || loading}
							className='mt-10 flex h-[50px] w-[215px] items-center justify-center rounded-md border-white bg-pink_primary text-lg text-white hover:bg-pink_secondary'
						>
							Create Post
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
};

export default styled(CreatePost)`
	.text-color {
		color: #334d6ee5;
	}
`;
