import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class Mi2uApi implements ICredentialType {
	name = 'mi2uApi';
	displayName = 'Mi2u API';
	documentationUrl = 'https://github.com/n1xuy/n8n-nodes-mi2u';
	properties: INodeProperties[] = [
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: '',
			placeholder: 'https://ics-uat.myinvoice2u.com/MYWs/ws/api',
			description: 'The base URL for the ICS API.',
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

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl}}',
			// You may need to change the url to a specific login endpoint, e.g., '/login'
			url: '/getToken',
			method: 'POST',
			body: {
				"username": "{{$credentials.username}}",
				"password": "{{$credentials.password}}"
			}
		},
	};

}
