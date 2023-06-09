// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useReducer, useState } from 'react';
import Parachain from './Parachain';
import Proposals from './Proposals';
import SubscribedPosts from './SubscribedPosts';
import Gov1Notification from './Gov1Notification';
import OpenGovNotification from './OpenGovNotification';
import NotificationChannels from './NotificationChannels';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkContext, useUserDetailsContext } from '~src/context';
import { PublicUser } from '~src/auth/types';
import Loader from '~src/ui-components/Loader';
import { notificationInitialState } from './Reducer/initState';
import { reducer } from './Reducer/reducer';
import { ACTIONS } from './Reducer/action';

export default function Notifications() {
	const { id, networkPreferences, setUserDetailsContextState, primaryNetwork } =
        useUserDetailsContext();
	const { network } = useNetworkContext();

	const [notificationPreferences, dispatch] = useReducer(
		reducer,
		notificationInitialState
	);
	console.log(notificationPreferences);

	const [selectedNetwork, setSelectedNetwork] = useState([
		{ name: network, selected: true }
	]);
	const [loading, setLoading] = useState(true);

	const handleCurrentNetworkNotifications = (obj: any) => {
		setUserDetailsContextState((prev) => ({
			...prev,
			networkPreferences: {
				...prev.networkPreferences,
				triggerPreferences: {
					...prev.networkPreferences.triggerPreferences,
					[network]: obj
				}
			}
		}));
	};

	const getNotificationSettings = async () => {
		try {
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/data/notificationSettings'
			)) as {data: any; error: null | string};
			if (error) {
				throw new Error(error);
			}
			if (data?.notification_preferences?.triggerPreferences) {
				setUserDetailsContextState((prev) => ({
					...prev,
					networkPreferences: {
						...prev.networkPreferences,
						triggerPreferences:
                            data?.notification_preferences?.triggerPreferences
					}
				}));
			}
			return data?.notification_preferences;
		} catch (e) {
			console.log(e);
		}
	};

	const getPrimaryNetwork = async () => {
		try {
			const { data, error } = (await nextApiClientFetch(
				`api/v1/auth/data/user?userId=${id}`
			)) as {data: PublicUser; error: null | string};
			if (error) {
				throw new Error(error);
			}
			if (data.primary_network) {
				setUserDetailsContextState((prev) => ({
					...prev,
					primaryNetwork: data.primary_network || ''
				}));
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleSetPrimaryNetwork = async (network: string) => {
		try {
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/actions/setPrimaryNetwork',
				{ primary_network: network }
			)) as {data: PublicUser; error: null | string};
			if (error) {
				throw new Error(error);
			}
			if (data?.primary_network) {
				setUserDetailsContextState((prev) => ({
					...prev,
					networkPreferences: {
						...prev.networkPreferences,
						primaryNetwork: data.primary_network || ''
					}
				}));
			}
		} catch (e) {
			console.log(e);
		}
	};

	const handleSetNetworkPreferences = async (networks: Array<string>) => {
		try {
			console.log(networkPreferences.triggerPreferences[network]);
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/actions/setNetworkPreferences',
				{
					network_preferences:
                        networkPreferences.triggerPreferences[network],
					networks
				}
			)) as {data: {message: string}; error: string | null};
			if (error || !data.message) {
				throw new Error(error || '');
			}
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		console.log('called');
		handleSetNetworkPreferences(selectedNetwork.map(({ name }) => name));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [networkPreferences.triggerPreferences]);

	const handleCopyPrimaryNetworkNotification = async (
		selectedNetwork: any
	) => {
		try {
			const primarySettings =
                networkPreferences.triggerPreferences?.[primaryNetwork];
			const { data, error } = (await nextApiClientFetch(
				'api/v1/auth/actions/setNetworkPreferences',
				{
					network_preferences: primarySettings,
					networks: selectedNetwork
				}
			)) as {data: {message: string}; error: string | null};
			if (error || !data.message) {
				throw new Error(error || '');
			}
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		getPrimaryNetwork().then(() => {
			getNotificationSettings().then((res) => {
				dispatch({
					payload: { data: res.triggerPreferences?.[network] || {}, network },
					type: ACTIONS.GET_NOTIFICATION_OBJECT
				});
				setLoading(false);
			});
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return loading ? (
		<Loader />
	) : (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
			<NotificationChannels />
			<Parachain
				primaryNetwork={primaryNetwork}
				onSetPrimaryNetwork={handleSetPrimaryNetwork}
				onSetNetworkPreferences={handleSetNetworkPreferences}
				onCopyPrimaryNetworkNotification={
					handleCopyPrimaryNetworkNotification
				}
				selectedNetwork={selectedNetwork}
				setSelectedNetwork={setSelectedNetwork}
			/>
			<Proposals
				userNotification={
					networkPreferences.triggerPreferences[network]
				}
				options={notificationPreferences.myProposal}
				dispatch={dispatch}
				onSetNotification={handleCurrentNetworkNotifications}
			/>
			<SubscribedPosts
				userNotification={
					networkPreferences.triggerPreferences[network]
				}
				options={notificationPreferences.subscribePost}
				dispatch={dispatch}
				onSetNotification={handleCurrentNetworkNotifications}
			/>
			<Gov1Notification
				userNotification={
					networkPreferences.triggerPreferences[network]
				}
				options={notificationPreferences.gov1Post}
				dispatch={dispatch}
				onSetNotification={handleCurrentNetworkNotifications}
			/>
			<OpenGovNotification
				userNotification={
					networkPreferences.triggerPreferences[network]
				}
				options={notificationPreferences.openGov}
				dispatch={dispatch}
				onSetNotification={handleCurrentNetworkNotifications}
			/>
		</div>
	);
}
