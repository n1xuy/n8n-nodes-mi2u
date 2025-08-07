import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

// Import JSON data directly
import countryCodes from '../../LHDN codes/CountryCodes.json';
import stateCodes from '../../LHDN codes/StateCodes.json';
import classificationCodes from '../../LHDN codes/ClassificationCodes.json';
import paymentMethods from '../../LHDN codes/PaymentMethods.json';
import eInvoiceTypes from '../../LHDN codes/EInvoiceTypes.json';
import currencyCodes from '../../LHDN codes/CurrencyCodes.json';
import unitTypes from '../../LHDN codes/UnitTypes.json';
import taxTypes from '../../LHDN codes/TaxTypes.json';
import msicCodes from '../../LHDN codes/MSICSubCategoryCodes.json';

// Map imported JSON data to INodePropertyOptions format
const countryOptions: INodePropertyOptions[] = countryCodes.map(item => ({ name: item.Country, value: item.Code }));
const stateOptions: INodePropertyOptions[] = stateCodes.map(item => ({ name: item.State, value: item.Code }));
const classificationOptions: INodePropertyOptions[] = classificationCodes.map(item => ({ name: item.Description, value: item.Code }));
const paymentMethodOptions: INodePropertyOptions[] = paymentMethods.map(item => ({ name: item['Payment Method'], value: item.Code }));
const invoiceTypeOptions: INodePropertyOptions[] = eInvoiceTypes.map(item => ({ name: item.Description, value: item.Code }));
const currencyOptions: INodePropertyOptions[] = currencyCodes.map(item => ({ name: item.Currency, value: item.Code }));
const unitTypeOptions: INodePropertyOptions[] = unitTypes.map(item => ({ name: item.Name, value: item.Code }));
const taxTypeOptions: INodePropertyOptions[] = taxTypes.map(item => ({ name: item.Description, value: item.Code }));
const MSICOptions: INodePropertyOptions[] = msicCodes.map(item => ({ name: item.Description, value: item.Code }));

export class Mi2uCreate implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mi2u Pass to ICS',
		name: 'mi2uCreate',
		icon: 'file:Mi2u.svg',
		group: ['transform'],
		version: 1,
		description: 'Custom Mi2u nodes that will proceed your invoice to ICS',
		defaults: {
			name: 'Mi2u Create',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'mi2uApi',
				required: true,
			},
		],
		properties: [
			// Invoice Details
			{
				displayName: 'Store Code',
				name: 'storeCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Invoice Code Number',
				name: 'invoiceCodeNumber',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Issue Mode',
				name: 'issueMode',
				type: 'string',
				default: '1',
				options: [
					{ name: 'Immediate Issuance', value: '1' },
					{ name: 'Delayed Issuance', value: '2' },
				],
			},
			{
				displayName: 'Invoice Type Code',
				name: 'invoiceTypeCode',
				type: 'options',
				default: '01',
				required: true,
				options: invoiceTypeOptions,
			},
			{
				displayName: 'Original Invoice Code Number',
				name: 'originalInvoiceCodeNumber',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Original Invoice UUID',
				name: 'originalInvoiceUuid',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Invoice Currency Code',
				name: 'invoiceCurrencyCode',
				type: 'options',
				default: 'MYR',
				required: true,
				options: currencyOptions,
			},
			{
				displayName: 'Exchange Rate',
				name: 'exchangeRate',
				type: 'string',
				default: '1',
			},
			{
				displayName: 'Invoice Date',
				name: 'invoiceDate',
				type: 'string',
				default: '',
				required: true,
				description: 'Format: YYYY-MM-DD',
			},
			{
				displayName: 'Invoice Time',
				name: 'invoiceTime',
				type: 'string',
				default: '',
				required: true,
				description: 'Format: HH:MM:SS',
			},
			{
				displayName: 'K1',
				name: 'k1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Incoterms',
				name: 'incoterms',
				type: 'string',
				default: '',
			},
			{
				displayName: 'FTA Information',
				name: 'ftaInformation',
				type: 'string',
				default: '',
			},
			{
				displayName: 'K2',
				name: 'k2',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Frequency of Billing',
				name: 'frequencyOfBilling',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Billing Period Start Date',
				name: 'billingPeriodStartDate',
				type: 'string',
				default: '',
				description: 'Format: YYYY-MM-DD',
			},
			{
				displayName: 'Billing Period End Date',
				name: 'billingPeriodEndDate',
				type: 'string',
				default: '',
				description: 'Format: YYYY-MM-DD',
			},
			{
				displayName: 'Total Excluding Tax',
				name: 'totalExcludingTax',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Total Including Tax',
				name: 'totalIncludingTax',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Total Payable Amount',
				name: 'totalPayableAmount',
				type: 'string',
				default: '',
				required: true,
			},

			// Supplier Details
			{
				displayName: 'Supplier Name',
				name: 'supplierName',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Supplier ID Type',
				name: 'supplierIdType',
				type: 'options',
				default: 'BRN',
				options: [
					{ name: 'Business Registration Number', value: 'BRN' },
					{ name: 'NRIC', value: 'NRIC' },
					{ name: 'Passport', value: 'PASSPORT' },
				],
			},
			{
				displayName: 'Supplier ID Value',
				name: 'supplierIdValue',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Supplier TIN',
				name: 'supplierTin',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Supplier SST',
				name: 'supplierSst',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Supplier TTX',
				name: 'supplierTTX',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Authorisation Number for Certified Exporter',
				name: 'authorisationNumberforCertifiedExporter',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Supplier Industry Code',
				name: 'supplierIndustryCode',
				type: 'options',
				default: '',
				options:MSICOptions,
				required: true,
			},
			{
				displayName: 'Supplier Business Activity Description',
				name: 'supplierBusinessActivityDescription',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Supplier Contact Number',
				name: 'supplierContactNumber',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Supplier Email',
				name: 'supplierEmail',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Supplier Country',
				name: 'supplierCountry',
				type: 'string',
				default: 'MYS',
				required: true,
				options: countryOptions,
			},
			{
				displayName: 'Supplier State',
				name: 'supplierState',
				type: 'options',
				default: '10',
				options: stateOptions,
			},
			{
				displayName: 'Supplier City Name',
				name: 'supplierCityName',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Supplier Address Line 0',
				name: 'supplierAddressLine0',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Supplier Address Line 1',
				name: 'supplierAddressLine1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Supplier Address Line 2',
				name: 'supplierAddressLine2',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Supplier Postal Zone',
				name: 'supplierPostalZone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Supplier Bank Account Number',
				name: 'supplierBankAccountNumber',
				type: 'string',
				default: '',
			},

			// Buyer Details (Optional)
			{
				displayName: 'Buyer Code',
				name: 'buyerCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer Name',
				name: 'buyerName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer ID Type',
				name: 'buyerIdType',
				type: 'options',
				default: 'BRN',
				options: [
					{ name: 'Business Registration Number', value: 'BRN' },
					{ name: 'NRIC', value: 'NRIC' },
					{ name: 'Passport', value: 'PASSPORT' },
				],
			},
			{
				displayName: 'Buyer ID Value',
				name: 'buyerIdValue',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer TIN',
				name: 'buyerTin',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer SST',
				name: 'buyerSst',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer Contact Number',
				name: 'buyerContactNumber',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer Email',
				name: 'buyerEmail',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer Country',
				name: 'buyerCountry',
				type: 'string',
				default: 'MYS',
				options: countryOptions,
			},
			{
				displayName: 'Buyer State',
				name: 'buyerState',
				type: 'options',
				default: '17',
				options: stateOptions,
			},
			{
				displayName: 'Buyer City Name',
				name: 'buyerCityName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer Address Line 0',
				name: 'buyerAddressLine0',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer Address Line 1',
				name: 'buyerAddressLine1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer Address Line 2',
				name: 'buyerAddressLine2',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Buyer Postal Zone',
				name: 'buyerPostalZone',
				type: 'string',
				default: '',
			},

			// Invoice Line Items
			{
				displayName: 'Invoice Line Items',
				name: 'invoiceLineItems',
				type: 'fixedCollection',
				default: {},
				placeholder: 'Add Invoice Line Item',
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Line Item',
						name: 'lineItem',
						values: [
							{
								displayName: 'Classification Code',
								name: 'classificationCode',
								type: 'options',
								default: '022',
								required: true,
								options: classificationOptions,
							},
							{
								displayName: 'Country of Origin',
								name: 'countryofOrigin',
								type: 'string',
								default: 'MYS',
								options: countryOptions,
							},
							{
								displayName: 'Discount Amount',
								name: 'discountAmount',
								type: 'string',
								default: '0.00',
							},
							{
								displayName: 'Discount Rate',
								name: 'discountRate',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Discount Reason',
								name: 'discountReason',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Fee/Charge Amount',
								name: 'feeChargeAmount',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Fee/Charge Rate',
								name: 'feeChargeRate',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Fee/Charge Reason',
								name: 'feeChargeReason',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Item Code',
								name: 'itemCode',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Item Name',
								name: 'itemName',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Measurement',
								name: 'measurement',
								type: 'options',
								default: 'EA',
								required: true,
								options: unitTypeOptions,
							},
							{
								displayName: 'Net Amount',
								name: 'netAmount',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Per Unit Amount',
								name: 'perUnitAmount',
								type: 'number',
								default: 0,
							},
							{
								displayName: 'Product Tariff Code',
								name: 'productTariffCode',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Quantity',
								name: 'quantity',
								type: 'number',
								default: 1,
								required: true,
							},
							{
								displayName: 'Subtotal',
								name: 'subtotal',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Tax Amount',
								name: 'tax',
								type: 'number',
								default: 0,
							},
							{
								displayName: 'Tax Percent',
								name: 'percent',
								type: 'number',
								default: 0,
							},
							{
								displayName: 'Tax Type',
								name: 'taxType',
								type: 'options',
								default: '06',
								required: true,
								options: taxTypeOptions,
							},
							{
								displayName: 'Total Excluding Tax',
								name: 'totalExcludingTax',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Unit Price',
								name: 'unitPrice',
								type: 'string',
								default: '',
								required: true,
							},
						],
					},
				],
			},

			// Tax Total
			{
				displayName: 'Total Tax Amount',
				name: 'totalTaxAmount',
				type: 'string',
				default: '0.00',
				required: true,
			},

			// Payment and Additional Fields
			{
				displayName: 'Payment Mode',
				name: 'paymentMode',
				type: 'options',
				default: '01',
				options: paymentMethodOptions
			},
			{
				displayName: 'Supplier Bank Account Number',
				name: 'supplierBankAccountNumber',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Pre Payment Reference Number',
				name: 'prePaymentReferenceNumber',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Pre Payment Amount',
				name: 'prePaymentAmount',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Pre Payment Date',
				name: 'prePaymentDate',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Pre Payment Time',
				name: 'prePaymentTime',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Bill Reference Number',
				name: 'billReferenceNumber',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Payment Terms',
				name: 'paymentTerms',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Total Net Amount',
				name: 'totalNetAmount',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Total Discount Value',
				name: 'totalDiscountValue',
				type: 'string',
				default: '0.00',
			},
			{
				displayName: 'Total Fee Charge Amount',
				name: 'totalFeeChargeAmount',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Rounding Amount',
				name: 'roundingAmount',
				type: 'number',
				default: 0,
			},

			// Allowance Charge List (Optional)
			{
				displayName: 'Allowance Charge List',
				name: 'allowanceChargeList',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'allowanceCharge',
						displayName: 'Allowance/Charge',
						values: [
							{
								displayName: 'Allowance Charge Indicator',
								name: 'allowanceChargeIndicator',
								type: 'options',
								default: 'true',
								required: true,
								options: [
									{ name: 'Charge', value: 'true' },
									{ name: 'Allowance', value: 'false' },
								],
							},
							{
								displayName: 'Allowance Charge Reason',
								name: 'allowanceChargeReason',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Allowance Charge Amount',
								name: 'allowanceChargeAmount',
								type: 'string',
								default: '',
								required: true,
							},
						],
					},
				],
			},

			// Shipping XML (Optional)
			{
				displayName: 'Shipping XML',
				name: 'shippingXML',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: false,
				},
				default: {},
				options: [
					{
						name: 'shipping',
						displayName: 'Shipping Details',
						values: [
							{
								displayName: 'Shipping Recipient Address Line 0',
								name: 'shippingRecipientAddressLine0',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Shipping Recipient Address Line 1',
								name: 'shippingRecipientAddressLine1',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Shipping Recipient Address Line 2',
								name: 'shippingRecipientAddressLine2',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Shipping Recipient City Name',
								name: 'shippingRecipientCityName',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Shipping Recipient Country',
								name: 'shippingRecipientCountry',
								type: 'string',
								default: 'MYS',
								required: true,
							},
							{
								displayName: 'Shipping Recipient Name',
								name: 'shippingRecipientName',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Shipping Recipient Postal Zone',
								name: 'shippingRecipientPostalZone',
								type: 'string',
								default: '',
								required: true,
							},
							{
								displayName: 'Shipping Recipient State',
								name: 'shippingRecipientState',
								type: 'string',
								default: '',
								required: true,
							},
						],
					},
				],
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
				const cookie = items[i].json.cookie as string;
				if (!cookie) {
					throw new NodeOperationError(this.getNode(), 'Cookie not found in input data. Make sure the Login node runs before this node.');
				}

				const invoiceLineItems = this.getNodeParameter('invoiceLineItems', i) as { lineItem?: any[] };

				if (!invoiceLineItems || !invoiceLineItems.lineItem || invoiceLineItems.lineItem.length === 0) {
					throw new NodeOperationError(this.getNode(), 'You must provide at least one Invoice Line Item.');
				}

				// Helper function to map state names/codes to API accepted format
				const mapStateCode = (stateValue: string, countryCode: string): string => {
					// API requires state field but doesn't accept LHDN codes
					// Let's try different state code formats

					if (countryCode !== 'MYS') {
						return '01'; // Default to first state for non-Malaysian addresses
					}

					// If it's already a valid 2-digit code, try alternative mapping
					if (/^\d{2}$/.test(stateValue)) {
						// Try returning the code as-is first
						return stateValue;
					}

					// Map state names to LHDN codes (API might accept these eventually)
					const stateMapping: { [key: string]: string } = {
						'johor': '01',
						'kedah': '02',
						'kelantan': '03',
						'melaka': '04',
						'malacca': '04',
						'negeri sembilan': '05',
						'pahang': '06',
						'pulau pinang': '07',
						'penang': '07',
						'perak': '08',
						'perlis': '09',
						'selangor': '10',
						'terengganu': '11',
						'sabah': '12',
						'sarawak': '13',
						'kuala lumpur': '14',
						'kl': '14',
						'labuan': '15',
						'putrajaya': '16',
						'not applicable': '17',
						'na': '17'
					};

					const normalizedState = stateValue.toLowerCase().trim();
					return stateMapping[normalizedState] || '17'; // Default to 'Not Applicable'
				};

				// Build the invoice data matching the reference JSON structure
				const invoiceData = {
					storeCode: this.getNodeParameter('storeCode', i, '') as string,
					invoiceCodeNumber: this.getNodeParameter('invoiceCodeNumber', i, '') as string,
					issueMode: this.getNodeParameter('issueMode', i, '2') as string,
					invoiceTypeCode: this.getNodeParameter('invoiceTypeCode', i, '01') as string,
					originalInvoiceCodeNumber: this.getNodeParameter('originalInvoiceCodeNumber', i, '') as string,
					originalInvoiceUuid: this.getNodeParameter('originalInvoiceUuid', i, '') as string,
					invoiceCurrencyCode: this.getNodeParameter('invoiceCurrencyCode', i, 'MYR') as string,
					exchangeRate: this.getNodeParameter('exchangeRate', i, '1') as string,
					invoiceDate: this.getNodeParameter('invoiceDate', i, '') as string,
					invoiceTime: this.getNodeParameter('invoiceTime', i, '') as string,
					k1: this.getNodeParameter('k1', i, '') as string,
					incoterms: this.getNodeParameter('incoterms', i, '') as string,
					ftaInformation: this.getNodeParameter('ftaInformation', i, '') as string,
					k2: this.getNodeParameter('k2', i, '') as string,
					totalExcludingTax: this.getNodeParameter('totalExcludingTax', i, '') as string,
					totalIncludingTax: this.getNodeParameter('totalIncludingTax', i, '') as string,
					totalPayableAmount: this.getNodeParameter('totalPayableAmount', i, '') as string,
					supplier: {
						supplierAddress: {
							addressLine0: this.getNodeParameter('supplierAddressLine0', i, '') as string,
							addressLine1: this.getNodeParameter('supplierAddressLine1', i, '') as string,
							addressLine2: this.getNodeParameter('supplierAddressLine2', i, '') as string,
							cityName: this.getNodeParameter('supplierCityName', i, '') as string,
							country: this.getNodeParameter('supplierCountry', i, 'MYS') as string,
							postalZone: this.getNodeParameter('supplierPostalZone', i, '') as string,
							state: mapStateCode(this.getNodeParameter('supplierState', i, '17') as string, this.getNodeParameter('supplierCountry', i, 'MYS') as string),
						},
						authorisationNumberforCertifiedExporter: this.getNodeParameter('authorisationNumberforCertifiedExporter', i, '') as string,
						supplierTTX: this.getNodeParameter('supplierTTX', i, '') as string,
						supplierBusinessActivityDescription: this.getNodeParameter('supplierBusinessActivityDescription', i, '') as string,
						supplierContactNumber: this.getNodeParameter('supplierContactNumber', i, '') as string,
						supplierEmail: this.getNodeParameter('supplierEmail', i, '') as string,
						supplierIndustryCode: this.getNodeParameter('supplierIndustryCode', i, '') as string,
						supplierName: this.getNodeParameter('supplierName', i, '') as string,
						supplierRegistration: {
							idType: this.getNodeParameter('supplierIdType', i, 'BRN') as string,
							idValue: this.getNodeParameter('supplierIdValue', i, '') as string,
							sst: this.getNodeParameter('supplierSst', i, '') as string,
							tin: this.getNodeParameter('supplierTin', i, '') as string,
							ttx: this.getNodeParameter('supplierTTX', i, '') as string,
						},
					},
					buyer: this.getNodeParameter('buyerName', i, '') ? {
						buyerCode: this.getNodeParameter('buyerCode', i, '') as string,
						buyerRegistration: {
							idType: this.getNodeParameter('buyerIdType', i, 'BRN') as string,
							idValue: this.getNodeParameter('buyerIdValue', i, '') as string,
							sst: this.getNodeParameter('buyerSst', i, '') as string,
							tin: this.getNodeParameter('buyerTin', i, '') as string,
						},
						buyerName: this.getNodeParameter('buyerName', i, '') as string,
						buyerContactNumber: this.getNodeParameter('buyerContactNumber', i, '') as string,
						buyerEmail: this.getNodeParameter('buyerEmail', i, '') as string,
						buyerAddress: {
							country: this.getNodeParameter('buyerCountry', i, 'MYS') as string,
							state: mapStateCode(this.getNodeParameter('buyerState', i, '17') as string, this.getNodeParameter('buyerCountry', i, 'MYS') as string),
							cityName: this.getNodeParameter('buyerCityName', i, '') as string,
							addressLine0: this.getNodeParameter('buyerAddressLine0', i, '') as string,
							addressLine1: this.getNodeParameter('buyerAddressLine1', i, '') as string,
							addressLine2: this.getNodeParameter('buyerAddressLine2', i, '') as string,
							postalZone: this.getNodeParameter('buyerPostalZone', i, '') as string,
						},
					} : null,
					invoiceLineItemList: (invoiceLineItems.lineItem || []).map((item: any) => ({
						itemName: item.itemName,
						itemCode: item.itemCode,
						measurement: item.measurement,
						quantity: item.quantity,
						totalExcludingTax: item.totalExcludingTax,
						unitPrice: item.unitPrice,
						discountAmount: item.discountAmount || '0.00',
						discountRate: item.discountRate || '0.00',
						discountReason: item.discountReason || '',
						feeChargeRate: item.feeChargeRate || '0.00',
						feeChargeAmount: item.feeChargeAmount || '',
						feeChargeReason: item.feeChargeReason || '',
						countryofOrigin: item.countryofOrigin || 'MYS',
						productTariffCode: item.productTariffCode || '',
						subtotal: item.subtotal,
						classificationList: [
							{
								code: item.classificationCode,
								group: 'CLASS',
							},
						],
						taxTotal: {
							totalTaxAmount: item.tax?.toString() || '0.00',
							taxSubTotalList: [
								{
									taxType: item.taxType,
									percent: item.percent || 0,
									perUnitAmount: item.perUnitAmount || 0,
									measurement: item.measurement,
									quantity: item.quantity,
									netAmount: item.netAmount,
									tax: item.tax || 0,
								},
							],
						},
					})),
					taxTotal: {
						totalTaxAmount: this.getNodeParameter('totalTaxAmount', i, '0.00') as string,
						taxSubTotalList: (invoiceLineItems.lineItem || []).map((item: any) => ({
							taxType: item.taxType,
							percent: item.percent || 0,
							perUnitAmount: item.perUnitAmount || 0,
							measurement: item.measurement,
							quantity: 0,
							netAmount: this.getNodeParameter('totalExcludingTax', i, '0.00') as string,
							tax: item.tax || 0,
						})),
					},
					allowanceChargeList: (() => {
					const allowanceChargeData = this.getNodeParameter('allowanceChargeList', i, { allowanceCharge: [] }) as { allowanceCharge?: any[] };
					return (allowanceChargeData.allowanceCharge || []).map((charge: any) => ({
						allowanceChargeIndicator: charge.allowanceChargeIndicator,
						allowanceChargeReason: charge.allowanceChargeReason,
						allowanceChargeAmount: charge.allowanceChargeAmount,
					}));
				})(),
					paymentMode: this.getNodeParameter('paymentMode', i, '01') as string,
					supplierBankAccountNumber: this.getNodeParameter('supplierBankAccountNumber', i, '') as string,
					prePaymentReferenceNumber: this.getNodeParameter('prePaymentReferenceNumber', i, '') as string,
					prePaymentAmount: this.getNodeParameter('prePaymentAmount', i, '') as string,
					prePaymentDate: this.getNodeParameter('prePaymentDate', i, '') as string,
					prePaymentTime: this.getNodeParameter('prePaymentTime', i, '') as string,
					billReferenceNumber: this.getNodeParameter('billReferenceNumber', i, '') as string,
					paymentTerms: this.getNodeParameter('paymentTerms', i, '') as string,
					totalNetAmount: this.getNodeParameter('totalNetAmount', i, '') as string,
					totalDiscountValue: this.getNodeParameter('totalDiscountValue', i, '0.00') as string,
					totalFeeChargeAmount: this.getNodeParameter('totalFeeChargeAmount', i, '') as string,
					roundingAmount: this.getNodeParameter('roundingAmount', i, 0) as number,
					shippingXML: (() => {
					const shippingData = this.getNodeParameter('shippingXML', i, { shipping: [] }) as { shipping?: any[] };
					if (shippingData.shipping && shippingData.shipping.length > 0) {
						const shipping = shippingData.shipping[0];
						return {
							shippingRecipientName: shipping.shippingRecipientName,
							shippingRecipientAddress: {
								addressLine0: shipping.shippingRecipientAddressLine0,
								addressLine1: shipping.shippingRecipientAddressLine1 || '',
								addressLine2: shipping.shippingRecipientAddressLine2 || '',
								cityName: shipping.shippingRecipientCityName,
								postalZone: shipping.shippingRecipientPostalZone,
								state: shipping.shippingRecipientState,
								country: shipping.shippingRecipientCountry,
							},
						};
					}
					return null;
				})(),
				};

				console.log(JSON.stringify(invoiceData, null, 2));

				const encodedContent = Buffer.from(JSON.stringify([invoiceData])).toString('base64');

				const requestBody = {
					interfaceCode: 'MY101',
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

				const responseData = await this.helpers.httpRequest(options);

				// Create a custom, structured response
				let customResponse: any = {
					returnCode: responseData.returnCode,
					returnMsg: responseData.returnMsg,
					decodedContent: {},
				};

				if (responseData.content) {
					try {
						const decodedContent = Buffer.from(responseData.content, 'base64').toString('utf-8');
						customResponse.decodedContent = JSON.parse(decodedContent);
					} catch (e) {
						// If decoding or parsing fails, include raw content as string
						customResponse.decodedContent = { rawContent: responseData.content };
					}
				}

				// If the API indicates an error, add the error message to the response
				if (responseData.returnCode !== '00') {
					customResponse.errorMessage = responseData.returnMsg || 'Unknown error';
				}

				returnData.push({ json: customResponse });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: this.getInputData(i)[0].json, error, pairedItem: i });
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
