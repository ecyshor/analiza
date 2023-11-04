import { Layout, LayoutProps, Menu } from 'react-admin';

export const AdminCustomLayout = (props: LayoutProps) => <Layout {...props} menu={CustomMenu} />

const CustomMenu = () => <Menu>
	<Menu.DashboardItem />
	<Menu.Item to="/data" primaryText="Data" />
	<Menu.Item to="/setup" primaryText="Setup script" />
	<Menu.ResourceItem name="domains" />
</Menu>