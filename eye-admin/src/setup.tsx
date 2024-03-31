import { Grid, Typography } from '@mui/material'
import { FC } from 'react';

interface SetupAnalizaProps {
	tenantId: string
}

export const SetupAnaliza: FC<SetupAnalizaProps> = ({ tenantId }) => {
	const script = `<script src="https://cdn.jsdelivr.net/gh/ecyshor/analiza@main/tracker/analiza.min.js" tenant="${tenantId}"></script>`
	return (
		<Grid
			container
			direction="column"
			justifyContent="center"
			alignItems="center"
			style={{ minHeight: '100vh' }}
		>
			<Grid item>
				<div>
					To setup the tracking add the following script to your website:
				</div>
				<Typography component="pre">
					{script}
				</Typography>
			</Grid>
		</Grid>
	);
}