// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ProgressReportIcon from '~assets/icons/progressIcon.svg';

import React, { FC } from 'react';
const { Panel } = Collapse;

interface IProgressReport {
	className?: string;
}

const ProgressReport: FC<IProgressReport> = (className) => {
	return (
		<div className={`${className}`}>
			<Collapse
				size='large'
				className={'bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
				// theme={theme}
			>
				<Panel
					header={
						<div className='channel-header flex items-center gap-[6px]'>
							<ProgressReportIcon />
							<h3 className='mb-0 ml-1 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>
								Progress Reports
							</h3>
						</div>
					}
					key='1'
				>
					<h1 className='text-white'>hello</h1>
				</Panel>
			</Collapse>
		</div>
	);
};

export default ProgressReport;