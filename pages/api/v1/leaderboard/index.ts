// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiHandler } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import messages from '~src/util/messages';
import { MessageType, LeaderboardEntry, User } from '~src/auth/types';
import { firestore_db } from '~src/services/firebaseInit';
import { LISTING_LIMIT } from '~src/global/listingLimit';

export interface LeaderboardResponse {
	count: number;
	data: LeaderboardEntry[];
}

export const getLeaderboard = async ({ page, username = '' }: { page: number; username: string }) => {
	try {
		const totalUsers = (await firestore_db.collection('users').count().get()).data().count || 0;

		const usersQuery = username ? firestore_db.collection('users').where('username', '==', username) : firestore_db.collection('users');

		const users = (
			await usersQuery
				.orderBy('profile_score', 'desc')
				.orderBy('created_at', 'asc')
				.offset(username ? 0 : (Number(page) - 1) * LISTING_LIMIT)
				.limit(username ? 1 : LISTING_LIMIT)
				.get()
		).docs.map((doc) => {
			const userData = doc.data() as User;
			return {
				addresses: [],
				created_at: userData.created_at,
				profile_score: userData.profile_score,
				user_id: userData.id,
				username: userData.username,
				...userData.profile
			} as LeaderboardEntry;
		});

		return {
			data: { count: totalUsers, data: users } as LeaderboardResponse,
			error: null,
			status: 200
		};
	} catch (error) {
		return {
			data: null,
			error: error.message || messages.API_FETCH_ERROR,
			status: Number(error.name) || 500
		};
	}
};

const handler: NextApiHandler<LeaderboardResponse | MessageType> = async (req, res) => {
	const { page = 1, username = '' } = req.body;

	if (isNaN(page) || (username && typeof username !== 'string')) {
		return res.status(400).json({ message: messages.INVALID_REQUEST_BODY });
	}

	const { data, error, status } = await getLeaderboard({
		page,
		username
	});

	if (error || !data) {
		return res.status(status).json({ message: error || messages.API_FETCH_ERROR });
	}
	if (data) {
		return res.status(status).json(data);
	}
};

export default withErrorHandling(handler);