import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Mi2uApi implements ICredentialType {
	name = 'mi2uApi';
	displayName = 'Mi2u API';
	documentationUrl = 'https://github.com/AxiomCode93/n8n-nodes-mi2u';
	properties: INodeProperties[] = [
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: '',
			placeholder: 'https://api.example.com',
			description: 'The base URL of the Mi2u API',
		},
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		},
	];
}
