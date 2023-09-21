// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { Switch } from 'antd';
import { CollapseIcon, ExpandIcon } from '~src/ui-components/CustomIcons';
import ChatActive from '~assets/icons/chat-active.svg';
import GroupCheckbox from '../common-ui/GroupCheckbox';
import { ACTIONS } from '../Reducer/action';
import { EMentionType, INotificationObject } from '../types';
import { Collapse } from '../common-ui/Collapse';
import { useTheme } from 'next-themes';

const { Panel } = Collapse;

type Props = {
	onSetNotification: (obj: INotificationObject) => void;
	dispatch: React.Dispatch<any>;
	options: any;
	userNotification: INotificationObject
};

export default function Proposals({
	onSetNotification,
	dispatch,
	options,
	userNotification
}: Props) {
	const [active, setActive] = useState<boolean | undefined>(false);
	const [all, setAll] = useState(false);
	const { resolvedTheme:theme } = useTheme();
	useEffect(() => {
		setAll(options.every((category: any) => category.selected));
	}, [options]);

	const handleAllClick = (checked: boolean) => {
		dispatch({
			payload: {
				params: { checked }
			},
			type: ACTIONS.MY_PROPOSAL_ALL_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		options.forEach((option: any) => {
			const trigger = option.triggerPreferencesName;
			if(trigger === 'newMention'){
				notification[option.triggerName] = {
					enabled: checked,
					mention_types: [EMentionType.COMMENT, EMentionType.REPLY],
					name: option?.triggerPreferencesName
				};
			}
			else if (trigger === 'ownProposalCreated') {
				notification[option.triggerName] = {
					enabled: checked,
					name: option?.triggerPreferencesName
				};
			} else {
				let subTriggers = notification?.[option.triggerName]?.sub_triggers || [];
				if (checked) {
					if (!subTriggers.includes(trigger)) subTriggers.push(trigger);
				} else {
					subTriggers = subTriggers.filter((postType: string) => postType !== trigger);
				}
				notification[option.triggerName] = {
					enabled: subTriggers.length > 0,
					name: option?.triggerName,
					sub_triggers: subTriggers
				};
			}
		});
		onSetNotification(notification);
		setAll(checked);
	};

	const handleChange = (
		categoryOptions: any,
		checked: boolean,
		value: string
	) => {
		dispatch({
			payload: {
				params: { categoryOptions, checked, value }
			},
			type: ACTIONS.MY_PROPOSAL_SINGLE_CHANGE
		});
		const notification = Object.assign({}, userNotification);
		const option = categoryOptions.find((opt: any) => opt.label === value);
		const trigger = option.triggerPreferencesName;
		if(trigger === 'newMention'){
			notification[option.triggerName] = {
				enabled: checked,
				mention_types: [EMentionType.COMMENT, EMentionType.REPLY],
				name: option?.triggerPreferencesName
			};
		}
		else if (trigger === 'ownProposalCreated') {
			notification[option.triggerName] = {
				enabled: checked,
				name: option?.triggerPreferencesName
			};
		} else {
			let subTriggers = notification?.[option.triggerName]?.sub_triggers || [];
			if (checked) {
				if (!subTriggers.includes(trigger)) subTriggers.push(trigger);
			} else {
				subTriggers = subTriggers.filter((postType: string) => postType !== trigger);
			}
			notification[option.triggerName] = {
				enabled: subTriggers.length > 0,
				name: option?.triggerName,
				sub_triggers: subTriggers
			};
		}
		onSetNotification(notification);
	};

	return (
		<Collapse
			size='large'
			className='bg-white dark:bg-section-dark-overlay'
			theme={theme}
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				setActive(isActive);
				return isActive ? <CollapseIcon className='text-lightBlue dark:text-blue-dark-medium' /> : <ExpandIcon className='text-lightBlue dark:text-blue-dark-medium'/>;
			}}
		>
			<Panel
				header={
					<div className='flex items-center gap-[6px] channel-header'>
						<ChatActive />
						<h3 className='font-semibold text-[16px] text-blue-light-high dark:text-blue-dark-high md:text-[18px] tracking-wide leading-[21px] mb-0'>
							My Proposals
						</h3>
						{!!active && (
							<>
								<span className='flex gap-[8px] items-center'>
									<Switch
										size='small'
										id='postParticipated'
										onChange={(checked, e) => {
											e.stopPropagation();
											handleAllClick(checked);
										}}
										checked={all}
									/>
									<p className='m-0 text-[#485F7D] dark:text-blue-dark-medium'>All</p>
								</span>
							</>
						)}
					</div>
				}
				key='1'
			>
				<GroupCheckbox
					categoryOptions={options}
					onChange={handleChange}
				/>
			</Panel>
		</Collapse>
	);
}
