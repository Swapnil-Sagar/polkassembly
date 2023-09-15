// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { DownOutlined, LogoutOutlined, SettingOutlined, UserOutlined, CheckCircleFilled } from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, Layout, Menu, MenuProps, Modal, Skeleton } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { NextComponentType, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import React, { ReactNode, memo, useEffect, useState } from 'react';
import { isExpired } from 'react-jwt';
import { useApiContext, useNetworkContext, useUserDetailsContext } from 'src/context';
import { getLocalStorageToken, logout } from 'src/services/auth.service';
import { AuctionAdminIcon, BountiesIcon, CalendarIcon, DemocracyProposalsIcon, DiscussionsIcon, FellowshipGroupIcon, GovernanceGroupIcon, MembersIcon, MotionsIcon, NewsIcon, OverviewIcon, ParachainsIcon, PreimagesIcon, ReferendaIcon, RootIcon, StakingAdminIcon, TreasuryGroupIcon, TechComProposalIcon , DelegatedIcon, ApplayoutIdentityIcon } from 'src/ui-components/CustomIcons';
import styled from 'styled-components';
import Link from 'next/link';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { isFellowshipSupported } from '~src/global/fellowshipNetworks';
import { isGrantsSupported } from '~src/global/grantsNetworks';
import DelegationDashboardEmptyState from '~assets/icons/delegation-empty-state.svg';

import { networkTrackInfo } from '~src/global/post_trackInfo';
import { PostOrigin } from '~src/types';
import Footer from './Footer';
import NavHeader from './NavHeader';
import { chainProperties } from '~src/global/networkConstants';
import { network as AllNetworks } from '~src/global/networkConstants';
import OpenGovHeaderBanner from './OpenGovHeaderBanner';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import dynamic from 'next/dynamic';
import IdentityCaution from '~assets/icons/identity-caution.svg';
import CloseIcon from '~assets/icons/close-icon.svg';
import { poppins } from 'pages/_app';
import getEncodedAddress from '~src/util/getEncodedAddress';

const OnChainIdentity = dynamic(() => import('~src/components/OnchainIdentity'),{
	loading: () => <Skeleton.Button active />,
	ssr: false
});

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getSiderMenuItem(
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode,
	children?: MenuItem[]
): MenuItem {
	return {
		children,
		icon,
		key,
		label,
		type: key === 'tracksHeading' ? 'group' : ''
	} as MenuItem;
}

export const onchainIdentitySupportedNetwork:Array<string> = [AllNetworks.POLKADOT];

interface Props {
	Component: NextComponentType<NextPageContext, any, any>;
	pageProps: any;
	className?: string;
}

const getUserDropDown = (handleSetIdentityClick: any, isIdentityUnverified: boolean, isGood: boolean, handleLogout: any, network: string, img?: string | null, username?: string, className?:string): MenuItem => {
	const dropdownMenuItems: ItemType[] = [
		{
			key: 'view profile',
			label: <Link className='text-bodyBlue hover:text-pink_primary font-medium flex items-center gap-x-2' href={`/user/${username}`}>
				<UserOutlined />
				<span>View Profile</span>
			</Link>
		},
		{
			key: 'settings',
			label: <Link className='text-bodyBlue hover:text-pink_primary font-medium flex items-center gap-x-2' href='/settings?tab=account'>
				<SettingOutlined />
				<span>Settings</span>
			</Link>
		},
		{
			key: 'logout',
			label: <Link href='/' className='text-bodyBlue hover:text-pink_primary font-medium flex items-center gap-x-2'
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					handleLogout(username);
				}}>
				<LogoutOutlined />
				<span>Logout</span>
			</Link>
		}
	];

	if(onchainIdentitySupportedNetwork.includes(network)){
		dropdownMenuItems.splice(1, 0 , {
			key: 'set on-chain identity',
			label: <Link className={`text-lightBlue hover:text-pink_primary font-medium flex items-center gap-x-2 -ml-1 ${className}`} href={''}
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					handleSetIdentityClick();
				}}>
				<span className='text-lg ml-[2px]'><ApplayoutIdentityIcon /></span>
				<span>Set on-chain identity</span>
				{isIdentityUnverified && <span className='flex items-center'><IdentityCaution/></span>}
			</Link>
		});
	}

	const AuthDropdown = ({ children }: {children: ReactNode}) => (
		<Dropdown className="user-menu-container" menu={{ items: dropdownMenuItems }} trigger={['click']}>
			{children}
		</Dropdown>
	);

	return getSiderMenuItem(
		<AuthDropdown>
			<div className='flex items-center justify-between gap-x-2'>
				<span className='truncate w-[85%] normal-case'>{username || ''}</span>
				{isGood  && !isIdentityUnverified && <CheckCircleFilled style={ { color:'green' } } className='rounded-[50%] bg-white border-none' />}
				<DownOutlined className='arrow-dropdown text-navBlue hover:text-pink_primary text-base -mt-1' />
			</div>
		</AuthDropdown>,
		'userMenu',
		<AuthDropdown>
			{img ? <Avatar className='-ml-2.5 mr-2 user-image' size={40} src={img} /> :
				<Avatar className='-ml-2.5 mr-2 user-image' size={40} icon={<UserOutlined />} />
			}
		</AuthDropdown>);
};

interface Props {
	Component: NextComponentType<NextPageContext, any, any>;
	pageProps: any;
	className?: string;
}

const AppLayout = ({ className, Component, pageProps }: Props) => {
	const { network } = useNetworkContext();
	const { api, apiReady } = useApiContext();
	const { setUserDetailsContextState, username, picture } = useUserDetailsContext();
	const [sidedrawer, setSidedrawer] = useState<boolean>(false);
	const [identityMobileModal, setIdentityMobileModal] = useState<boolean>(false);
	const router = useRouter();
	const [open, setOpen] = useState<boolean>(false);
	const [openAddressLinkedModal, setOpenAddressLinkedModal] = useState<boolean>(false);

	// const currentUser = useUserDetailsContext();
	const [previousRoute, setPreviousRoute] = useState(router.asPath);
	const isMobile = typeof window !== 'undefined' && window.screen.width < 1024;

	// const { defaultAddress,web3signup } = currentUser;
	const [isIdentityUnverified, setIsIdentityUnverified] = useState<boolean>(false);
	const [isGood, setIsGood] = useState<boolean>(false);
	const [mainDisplay, setMainDisplay] = useState<string>('');

	useEffect(() => {
		const handleRouteChange = () => {
			if(router.asPath.split('/')[1] !== 'discussions' && router.asPath.split('/')[1] !== 'post' ){
				setPreviousRoute(router.asPath);
			}
		};
		router.events.on('routeChangeStart', handleRouteChange);

		return () => {
			router.events.off('routeChangeStart', handleRouteChange);
		};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]);

	useEffect(() => {
		if(!global?.window) return;
		const authToken = getLocalStorageToken();
		if(authToken && isExpired(authToken)) {
			logout(setUserDetailsContextState);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.asPath]);

	useEffect(() => {
		if(!window || !(window as any).ethereum || !(window as any).ethereum.on) return;
		(window as any).ethereum.on('accountsChanged', () => {
			window.location.reload();
		});
	}, []);

	useEffect(() => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;
		const address = localStorage.getItem('loginAddress');
		const encoded_addr = address ? getEncodedAddress(address, network) : '';

		if(!encoded_addr) return;

		api.derive.accounts.info(encoded_addr, (info: DeriveAccountInfo) => {

			if (info.identity.displayParent && info.identity.display){
				// when an identity is a sub identity `displayParent` is set
				// and `display` get the sub identity
				setMainDisplay(info.identity.displayParent);
			} else {
				// There should not be a `displayParent` without a `display`
				// but we can't be too sure.
				setMainDisplay(info.identity.displayParent || info.identity.display || info.nickname || '' );
			}
			const infoCall = info.identity?.judgements.filter(([, judgement]): boolean => judgement.isFeePaid);
			const judgementProvided = infoCall?.some(([, judgement]): boolean => judgement.isFeePaid);
			const isGood = info.identity?.judgements.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
			setIsGood(Boolean(isGood));
			setIsIdentityUnverified(judgementProvided || !info?.identity?.judgements?.length);

		})
			.then(unsub => { unsubscribe = unsub; })
			.catch(e => console.error(e));

		return () => unsubscribe && unsubscribe();

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	const gov1Items: {[x:string]: ItemType[]} = {
		overviewItems: [
		],
		democracyItems: chainProperties[network]?.subsquidUrl ? [
			getSiderMenuItem('Proposals', '/proposals', null),
			getSiderMenuItem('Referenda', '/referenda', null)
		] : [],
		councilItems: chainProperties[network]?.subsquidUrl ? [
			getSiderMenuItem('Motions', '/motions', <MotionsIcon className='text-white' />),
			getSiderMenuItem('Members', '/council', <MembersIcon className='text-white' />)
		] : [],
		treasuryItems: chainProperties[network]?.subsquidUrl ? [
			getSiderMenuItem('Proposals', '/treasury-proposals', null),
			getSiderMenuItem('Tips', '/tips',null)
		] : [],
		techCommItems: chainProperties[network]?.subsquidUrl ? [
			getSiderMenuItem('Proposals', '/tech-comm-proposals', <TechComProposalIcon className='text-white' />)
		] : [],
		allianceItems: chainProperties[network]?.subsquidUrl ? [
			getSiderMenuItem('Announcements', '/alliance/announcements', <NewsIcon className='text-white' />),
			getSiderMenuItem('Motions', '/alliance/motions', <MotionsIcon className='text-white' />),
			getSiderMenuItem('Unscrupulous', '/alliance/unscrupulous', <ReferendaIcon className='text-white' />),
			getSiderMenuItem('Members', '/alliance/members', <MembersIcon className='text-white' />)
		] : []
	};

	if(!isOpenGovSupported(network)){
		gov1Items.treasuryItems.push(getSiderMenuItem('Bounties', '/bounties'),
			getSiderMenuItem('Child Bounties', '/child_bounties'));
	}

	const handleLogout = async () => {
		logout(setUserDetailsContextState);
		router.replace(router.asPath);
	};

	const handleIdentityButtonClick = () => {
		const address = localStorage.getItem('identityAddress');
		if(isMobile){
			setIdentityMobileModal(true);
		}else{
			if(address?.length){
				setOpen(!open);
			}else {
				setOpenAddressLinkedModal(true);
			}
		}

	};

	let items: MenuProps['items'] = [
		...gov1Items.overviewItems
	];

	if(chainProperties[network]?.subsquidUrl) {
		items = items.concat([
			getSiderMenuItem('Democracy', 'gov1_democracy_group', <DemocracyProposalsIcon className='text-sidebarBlue' />, [
				...gov1Items.democracyItems
			]),

			getSiderMenuItem('Treasury', 'gov1_treasury_group', <TreasuryGroupIcon className='text-sidebarBlue' />, [
				...gov1Items.treasuryItems
			]),

			getSiderMenuItem('Council', 'gov1_democracy_group', <MotionsIcon className='text-sidebarBlue' />, [
				...gov1Items.councilItems
			]),

			getSiderMenuItem('Tech Committee...', 'gov1_democracy_group', <TechComProposalIcon className='text-sidebarBlue' />, [
				...gov1Items.techCommItems
			])
			// getSiderMenuItem('Council Motions', '/motions', <MotionsIcon className='text-white' />),
			// getSiderMenuItem('Tech Committee Proposals', '/tech-comm-proposals', <TechComProposalIcon className='text-white' />)
		]);
	}

	if(network === AllNetworks.COLLECTIVES){
		const fellowshipItems = [getSiderMenuItem('Members', '/fellowship', <MembersIcon className='text-white' />), getSiderMenuItem('Member Referenda', '/member-referenda', <FellowshipGroupIcon className='text-sidebarBlue' />)];
		items = [...gov1Items.overviewItems, getSiderMenuItem('Alliance', 'alliance_group', null, [
			...gov1Items.allianceItems
		]), getSiderMenuItem('Fellowship', 'fellowship_group', null, fellowshipItems)];
	} else if (network === AllNetworks.WESTENDCOLLECTIVES) {
		items = [...gov1Items.overviewItems, getSiderMenuItem('Alliance', 'alliance_group', null, [
			...gov1Items.allianceItems
		])];
	}

	const gov2TrackItems: {[x:string]: ItemType[]} = {
		mainItems: [],
		governanceItems : [],
		treasuryItems: [getSiderMenuItem('Bounties', '/bounties'),
			getSiderMenuItem('Child Bounties', '/child_bounties')],
		fellowshipItems: [
			getSiderMenuItem('Members', '/members')
		]
	};

	if (isFellowshipSupported(network)) {
		gov2TrackItems?.fellowshipItems?.splice(0, 1, getSiderMenuItem('Members', '/fellowship'), getSiderMenuItem('Member Referenda', '/member-referenda'));
	}

	if(network && networkTrackInfo[network]) {
		for (const trackName of Object.keys(networkTrackInfo[network])) {
			if(!networkTrackInfo[network][trackName] || !('group' in networkTrackInfo[network][trackName])) continue;

			const menuItem = getSiderMenuItem(trackName.split(/(?=[A-Z])/).join(' '), `/${trackName.split(/(?=[A-Z])/).join('-').toLowerCase()}`);

			switch(networkTrackInfo[network][trackName].group) {
			case 'Governance':
				gov2TrackItems.governanceItems.push(menuItem);
				break;
			case 'Treasury':
				gov2TrackItems.treasuryItems.push(
					getSiderMenuItem(trackName.split(/(?=[A-Z])/).join(' '), `/${trackName.split(/(?=[A-Z])/).join('-').toLowerCase()}`)
				);
				break;
			case 'Whitelist':
				gov2TrackItems.fellowshipItems.push(
					getSiderMenuItem(trackName.split(/(?=[A-Z])/).join(' '), `/${trackName.split(/(?=[A-Z])/).join('-').toLowerCase()}`)
				);
				break;
			default: {
				const icon = trackName === PostOrigin.ROOT ? <RootIcon /> : trackName === PostOrigin.AUCTION_ADMIN ? <AuctionAdminIcon className='ml-0.5' /> :  <StakingAdminIcon />;
				gov2TrackItems.mainItems.push(
					getSiderMenuItem(trackName.split(/(?=[A-Z])/).join(' '), `/${trackName.split(/(?=[A-Z])/).join('-').toLowerCase()}`, icon)
				);
			}
			}
		}
	}

	const userDropdown = getUserDropDown( handleIdentityButtonClick, isIdentityUnverified, isGood, handleLogout,network ,picture, (mainDisplay || username)! , `${className} ${poppins.className} ${poppins.variable}`);
	// const userDropdown = getUserDropDown(handleIdentityButtonClick, handleLogout,network ,picture, username!, `${className} ${poppins.className} ${poppins.variable}`);
	const govOverviewItems = isOpenGovSupported(network) ? [
		getSiderMenuItem('Overview', '/', <OverviewIcon className='text-white mt-1' />),
		getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='text-white mt-1.5' />),
		getSiderMenuItem('Calendar', '/calendar', <CalendarIcon className='text-white' />),
		getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='text-white mt-2.5' />),
		getSiderMenuItem('Preimages', '/preimages', <PreimagesIcon className='mt-1' />)
	] :
		[
			getSiderMenuItem('Overview', '/', <OverviewIcon className='text-white mt-1' />),
			getSiderMenuItem('Discussions', '/discussions', <DiscussionsIcon className='text-white mt-1.5' />),
			getSiderMenuItem('Calendar', '/calendar', <CalendarIcon className='text-white' />),
			getSiderMenuItem('Parachains', '/parachains', <ParachainsIcon className='text-white mt-2.5' />)
		] ;

	if (isGrantsSupported(network)) {
		govOverviewItems.splice(2, 0, getSiderMenuItem('Grants', '/grants', <BountiesIcon className='text-white' />));
	}

	if(['kusama', 'polkadot'].includes(network)){
		govOverviewItems.splice(2, 0, getSiderMenuItem('Delegation', '/delegation', <DelegatedIcon className= 'mt-1.5'/> ));
	}

	const gov2Items:MenuProps['items'] = isOpenGovSupported(network) ? [
		...govOverviewItems,
		// Tracks Heading
		getSiderMenuItem(<span className='text-lightBlue hover:text-navBlue ml-2 uppercase text-base font-medium'>Tracks</span>, 'tracksHeading', null),
		...gov2TrackItems.mainItems,
		getSiderMenuItem('Governance', 'gov2_governance_group', <GovernanceGroupIcon className='text-sidebarBlue' />, [
			...gov2TrackItems.governanceItems
		]),
		getSiderMenuItem('Whitelist', 'gov2_fellowship_group', <FellowshipGroupIcon className='text-sidebarBlue' />, [
			...gov2TrackItems.fellowshipItems
		])
	] : [...govOverviewItems];

	if (isFellowshipSupported(network)) {
		gov2Items.splice(gov2Items.length - 1, 1, getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipGroupIcon className='text-sidebarBlue mt-1' />, [
			...gov2TrackItems.fellowshipItems
		]));
	}

	if(!['moonbeam', 'moonbase', 'moonriver'].includes(network) && isOpenGovSupported(network)){
		gov2Items.splice(-1, 0 , getSiderMenuItem('Treasury', 'gov2_treasury_group', <TreasuryGroupIcon className='text-sidebarBlue' />, [
			...gov2TrackItems.treasuryItems
		]));
	}

	gov2Items.push(getSiderMenuItem(<span className='text-lightBlue hover:text-navBlue ml-2  text-base font-medium'>Gov1</span>, 'tracksHeading', null,[
		...items
	]));

	const gov2CollapsedItems:MenuProps['items'] = [
		...govOverviewItems,
		...gov2TrackItems.mainItems,
		getSiderMenuItem('Governance', 'gov2_governance_group', <GovernanceGroupIcon className='text-white' />, [
			...gov2TrackItems.governanceItems
		]),
		getSiderMenuItem('Whitelist', 'gov2_fellowship_group', <FellowshipGroupIcon className='text-white' />, [
			...gov2TrackItems.fellowshipItems
		]),
		// getSiderMenuItem(<span className='text-lightBlue hover:text-navBlue ml-2  text-base font-medium'>Gov1</span>, 'tracksHeading', null,[
		...items
		// ])
	];

	if (isFellowshipSupported(network)) {
		gov2CollapsedItems.splice(gov2CollapsedItems.length - 1, 1, getSiderMenuItem('Fellowship', 'gov2_fellowship_group', <FellowshipGroupIcon className='text-white' />, [
			...gov2TrackItems.fellowshipItems
		]));
	}

	if(!['moonbeam', 'moonbase', 'moonriver'].includes(network)){
		gov2CollapsedItems.splice(-1, 0 , getSiderMenuItem('Treasury', 'gov2_treasury_group', <TreasuryGroupIcon className='text-white' />, [
			...gov2TrackItems.treasuryItems
		]));
	}

	const handleMenuClick = (menuItem: any) => {
		if(['userMenu', 'tracksHeading'].includes(menuItem.key)) return;
		if(menuItem.key!=='userdropwon'){
			router.push(menuItem.key);
			setSidedrawer(false);
		}
	};

	let sidebarItems = !sidedrawer ? gov2CollapsedItems : gov2Items;
	if(typeof window !== 'undefined' && username && window.screen.width < 1024 && (isOpenGovSupported(network))) {
		sidebarItems = [userDropdown, ...sidebarItems];
	}

	return (
		<Layout className={className}>
			<NavHeader sidedrawer={sidedrawer} setSidedrawer={setSidedrawer} sidedrawerHover={true} previousRoute={previousRoute} />
			<Layout hasSider>
				<Sider
					trigger={null}
					collapsible={false}
					collapsed={true}
					onMouseOver={() => setSidedrawer(true)}
					style={{ transform: sidedrawer ? 'translateX(-80px)' : 'translateX(0px)', transitionDuration: '0.3s' }}
					className={'hidden overflow-y-hidden sidebar bg-white lg:block bottom-0 left-0 top-[62px] h-screen fixed z-40'}
				>

					<Menu
						theme="light"
						mode="inline"
						selectedKeys={[router.pathname]}
						items={sidebarItems}
						onClick={handleMenuClick}
						className={`${username?'auth-sider-menu':''} mt-[20px]`}
					/>
				</Sider>
				<Drawer
					placement='left'
					closable={false}
					className='menu-container'
					onClose={() => setSidedrawer(false)}
					open={sidedrawer}
					getContainer={false}
					style={{
						bottom: 0,
						height: '100vh',
						left: 0,
						position: 'fixed',
						top: '62px'
					}}
				>
					<Menu
						theme="light"
						mode="inline"
						selectedKeys={[router.pathname]}
						defaultOpenKeys={['democracy_group', 'treasury_group', 'council_group', 'tech_comm_group', 'alliance_group']}
						items={sidebarItems}
						onClick={handleMenuClick}
						className={`${username?'auth-sider-menu':''} mt-[60px]`}
						onMouseLeave={() => setSidedrawer(false)}
					/>
				</Drawer>
				{
					((['moonbeam', 'moonriver'].includes(network) && ['/', '/gov-2'].includes(router.asPath)))?
						<Layout className='min-h-[calc(100vh - 10rem)] bg-[#F5F6F8]'>
							{/* Dummy Collapsed Sidebar for auto margins */}
							<OpenGovHeaderBanner network={'moonbeam'} />
							<div className='flex flex-row'>
								<div className="hidden lg:block bottom-0 left-0 w-[80px] -z-50"></div>
								<CustomContent Component={Component} pageProps={pageProps} />
							</div>
						</Layout>
						: <Layout className={'min-h-[calc(100vh - 10rem)] bg-[#F5F6F8] flex flex-row'}>
							{/* Dummy Collapsed Sidebar for auto margins */}
							<div className="hidden lg:block bottom-0 left-0 w-[80px] -z-50"></div>
							<CustomContent Component={Component} pageProps={pageProps} />
						</Layout>
				}
			</Layout>
			{ onchainIdentitySupportedNetwork.includes(network) && <OnChainIdentity open={open} setOpen={setOpen} openAddressLinkedModal={openAddressLinkedModal} setOpenAddressLinkedModal={setOpenAddressLinkedModal}/>}

			<Footer />
			<Modal
				open={identityMobileModal}
				footer={false}
				closeIcon={<CloseIcon/>}
				onCancel={() => setIdentityMobileModal(false)}
				className={`${poppins.className} ${poppins.variable} w-[600px] max-sm:w-full`}
				title={<span className='-mx-6 px-6 border-0 border-solid border-b-[1px] border-[#E1E6EB] pb-3 flex items-center gap-2 text-xl font-semibold'>
					On-chain identity
				</span>
				}
			>
				<div className='flex items-center text-center flex-col gap-6 py-4'>
					<DelegationDashboardEmptyState/>
					<span>Please use your desktop computer to verify on chain identity</span>
				</div>
			</Modal>
		</Layout>
	);
};

const CustomContent = memo(function CustomContent({ Component, pageProps } : Props) {
	return <Content className={'lg:opacity-100 flex-initial mx-auto min-h-[90vh] w-[94vw] lg:w-[85vw] 2xl:w-5/6 my-6 max-w-7xl'}>
		<Component {...pageProps} />
	</Content>;
});

export default styled(AppLayout)`

.svgLogo svg{
	height:60%;
}

.border-bottom {
	border-bottom: 1px solid #D2D8E0 ;

  }
  .border-right {
	border-right:1px solid #D2D8E0;
  }

.logo-border li:nth-child(1):hover{
	background:transparent !important;
}

#rc-menu-uuid-75314-4-{
	border-bottom:1px solid gray;
}

#rc-menu-uuid-44115-4- .logo-container {
	height: 100px !important;
}

.ant-drawer .ant-drawer-mask{
	position: fixed !important;
}

.ant-drawer .ant-drawer-content{
	height: auto !important;
}

.ant-drawer-content-wrapper, .ant-drawer-content{
	max-width: 256px !important;
	box-shadow: none !important;
	min-width: 60px !important;
}

.ant-drawer-body{
	text-transform: capitalize !important;
	padding: 0 !important;

	ul{
		margin-top: 0 !important;
	}
}

.ant-menu-item .anticon, .ant-menu-item-icon{
	font-size: 20px !important;
}

.ant-menu-item .delegation{
font-size: 20px !important;
}
.ant-menu-item .delegation .opacity{
opacity:1 !important;
margin-top: -17px !important; 
}


.ant-menu-item-selected {
	background: #fff !important;

	.ant-menu-title-content {
		color: var(--pink_primary) !important;
	}
}

.ant-menu-title-content:hover {
	color: var(--pink_primary) !important;
}

.ant-menu-item::after {
	border-right: none !important;
}

.ant-menu-title-content {
	color: #485F7D !important;
	font-weight: 500;
	font-size: 14px;
	line-height: 21px;
	letter-spacing: 0.01em;
}

.auth-sider-menu {
	list-style: none !important;
}

.ant-empty-image{
	display: flex;
	justify-content: center;
}

.sidebar .ant-menu-item-selected .anticon {
	filter: brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(321deg) brightness(90%) contrast(101%);
}

.sidebar .ant-menu-item-selected .opacity {
  background-color: var(--pink_primary) !important;
}
.ant-menu-inline-collapsed-noicon {
	color: var(--lightBlue);
}

.ant-menu-item-selected {
	.ant-menu-inline-collapsed-noicon {
		color: var(--pink_primary);
	}
}

.ant-menu-sub {
	background: #fff !important;
}

.ant-menu-item > .logo-container {
	height:100px ;
}

.logo-container:hover {
	background: #fff !important;
}

.menu-container {
	top: 0px;
}

.arrow-dropdown {
	transform: scale(0.8);
}

@media (max-width: 468px) and (min-width: 380px){
	.menu-container {
		top:62px !important;
	}

	.logo-display-block {
		display: none !important;
	}

	.user-container {
		display: flex!important;
		width: 200px !important;
		border: none !important;
		background-color: #fff !important;
	}

	.logo-container {
		display:flex !important;
	}

	.user-image {
		font-size: 14px !important;
	}

	.user-info {
		font-size: 14px !important;
	}

	.user-info-dropdown {
		transform: scale(0.7);
	}
}

`;