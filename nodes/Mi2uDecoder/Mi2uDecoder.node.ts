import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class Mi2uDecoder implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mi2u Decoder',
		name: 'mi2uDecoder',
		group: ['transform'],
		version: 1,
		description: 'Decodes a base64 string into JSON.',
		defaults: {
			name: 'Mi2u Decoder',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Base64 String',
				name: 'base64String',
				type: 'string',
				default: '',
				required: true,
				description: 'Just a test to decode a base 64 string',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const base64String = this.getNodeParameter('base64String', i, '') as string;

				if (!base64String) {
					throw new NodeOperationError(this.getNode(), 'Base64 string is empty. Please provide a valid string to decode.');
				}

				const decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
				const decodedJson = JSON.parse(decodedString);

				returnData.push({ json: decodedJson });

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
