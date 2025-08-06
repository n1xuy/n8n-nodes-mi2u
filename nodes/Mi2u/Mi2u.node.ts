import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * Mi2u Login Token Node
 *
 * This node handles authentication with the ICS API system.
 * It takes username/password credentials and returns a session cookie
 * that can be used by other Mi2u nodes for authenticated requests.
 *
 * @author Axiom
 * @version 1.0.0
 */
export class Mi2u implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mi2u Login Token',
		name: 'mi2u',
		icon: 'file:Mi2u.svg',
		group: ['transform'],
		version: 1,
		description: 'MI2U custom Node for Login and get Token for ICS',
		defaults: {
			name: 'Mi2u',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Login',
						value: 'login',
					},
				],
				default: 'login',
			},
			{
				displayName: 'API URL',
				name: 'apiUrl',
				type: 'string',
				default: '',
				placeholder: 'https://api.example.com/login',
				description: 'The URL of the API to call',
				required: true,
				displayOptions: {
					show: {
						resource: ['login'],
					},
				},
			},
			{
				displayName: 'Username',
				name: 'username',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['login'],
					},
				},
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['login'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0, 'login') as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'login') {
					const username = this.getNodeParameter('username', i, '') as string;
					const password = this.getNodeParameter('password', i, '') as string;
					const apiUrl = this.getNodeParameter('apiUrl', i, '') as string;

					const loginContent = {
						username: username,
						pwd: password,
					};

					const encodedContent = Buffer.from(JSON.stringify(loginContent)).toString('base64');

					const requestBody = {
						interfaceCode: 'LOGIN',
						content: encodedContent,
						returnCode: '',
						returnMsg: '',
						businessSystem: '',
					};

					const options: IHttpRequestOptions = {
						headers: {
							'Content-Type': 'application/json',
						},
						method: 'POST',
						body: JSON.stringify(requestBody),
						url: apiUrl,
						json: true,
						returnFullResponse: true, // We need the full response to get headers
					};

					const loginResponse = await this.helpers.httpRequest(options);
					const cookie = loginResponse.headers['set-cookie'];

					if (!cookie) {
						// Return a message indicating failure instead of throwing an error
						returnData.push({ json: { error: 'Login failed - no cookie received.', json_error: true } });
					} else {
						// Pass the cookie to the next node
						returnData.push({ json: { cookie: cookie, json_error: false } });
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(i)[0].json, error, pairedItem: i });
				} else {
					if (error.context) {
						error.context.itemIndex = i;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex: i,
					});
				}
			}
		}

		return [returnData];
	}
}
