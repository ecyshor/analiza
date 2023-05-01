import {Create, Datagrid, List, regex, SimpleForm, TextField, TextInput} from 'react-admin';

export const DomainList = () => (
    <List>
        <Datagrid>
            <TextField source="domain"/>
        </Datagrid>
    </List>
);

export const DomainCreate = (props: { tenantId: string }) => (
    <Create>
        <SimpleForm>
            <TextInput source="domain" validate={[regex(/.{1,200}\.[a-z]{2,63}/)]}
                       fullWidth/>
            <TextInput source="tenant_id" defaultValue={props.tenantId} hidden={true}/>
        </SimpleForm>
    </Create>
);
