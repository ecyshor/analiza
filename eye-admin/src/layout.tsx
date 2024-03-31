import { Layout, LayoutProps, Menu } from 'react-admin';

export const AdminCustomLayout = (props: LayoutProps) => <Layout {...props} menu={CustomMenu} />

const CustomMenu = () => <Menu>
	<Menu.Item to="/" primaryText="Data" />
	<Menu.ResourceItem name="domains" />
</Menu>