import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class Mi2uSearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mi2u Search Invoice',
		name: 'mi2uSearch',
		icon: 'file:Mi2u.svg',
		group: ['transform'],
		version: 1,
		description: 'MI2U custom node that search invoice from ICS',
		defaults: {
			name: 'Mi2u Search',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'TIN',
				name: 'tin',
				type: 'string',
				default: '',
				required: true,
				description: 'Taxpayer Identification Number',
			},
			{
				displayName: 'Document Number',
				name: 'documentNum',
				type: 'string',
				default: '',
				required: true,
				description: 'The document number to search for',
			},
		],
		credentials: [
			{
				name: 'mi2uApi',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('mi2uApi');
		const { apiUrl } = credentials;

		for (let i = 0; i < items.length; i++) {
			try {
				// Get the cookie from the input data from the previous node
				const cookie = items[i].json.cookie as string;

				if (!cookie) {
					throw new NodeOperationError(this.getNode(), 'Cookie not found in input data. Make sure the Login node runs before this node.');
				}

				const tin = this.getNodeParameter('tin', i, '') as string;
				const documentNum = this.getNodeParameter('documentNum', i, '') as string;

				const searchContent = {
					tin: tin,
					documentNum: documentNum,
				};

				const encodedContent = Buffer.from(JSON.stringify(searchContent)).toString('base64');

				const requestBody = {
					interfaceCode: 'MY111',
					content: encodedContent,
					returnCode: '',
					returnMsg: '',
					businessSystem: '',
				};

				const options: IHttpRequestOptions = {
					headers: {
						'Content-Type': 'application/json',
						'Cookie': cookie,
					},
					method: 'POST',
					body: JSON.stringify(requestBody),
					url: apiUrl as string,
					json: true,
				};

				const searchResponse = await this.helpers.httpRequest(options);

				// Create a custom, structured response
				const customResponse = {
					returnCode: searchResponse.returnCode,
					returnMsg: searchResponse.returnMsg,
					decodedContent: {},
				};

				if (searchResponse.returnCode === '00' && searchResponse.content) {
					const decodedContent = Buffer.from(searchResponse.content, 'base64').toString('utf-8');
					customResponse.decodedContent = JSON.parse(decodedContent);
				}

				returnData.push({ json: customResponse });
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
