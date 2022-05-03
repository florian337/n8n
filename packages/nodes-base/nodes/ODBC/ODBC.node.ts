import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';


export class ODBC implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ODBC',
		name: 'ODBC',
		icon: 'file:odbc.png',
		group: ['transform'],
		version: 1,
		description: 'Call to ODBC',
		defaults: {
			name: 'ODBC',
			color: '#1A82e2',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
		],
		properties: [
			{
				displayName: 'ODBC Type',
				name: 'odbcType',
				type: 'options',
				options: [
					{
						name: 'Custom',
						value: 'Custom',
					},
					{
						name: 'PostgreSQL',
						value: 'PostgreSQL',
					},
					{
						name: 'SQL Server',
						value: 'SQL Server',
					},
					{
						name: 'HFSQL',
						value: 'HFSQL',
					},
				],
				default: 'PostgreSQL',
				required: true,
				description: 'The ODBC to use',
			},
			{
				displayName: 'Driver',
				name: 'driver',
				type: 'string',
				required: false,
				default:'',
				description:'Driver of the database',
				displayOptions: {
					hide: {
						odbcType: [
							'Custom',
						],
					},
				},
			},
			{
				displayName: 'Custom Connection String',
				name: 'csCustom',
				type: 'string',
				required: false,
				default:'',
				description:'If your ODBC is not in the list, you can write your own connectionString',
				displayOptions: {
					show: {
						odbcType: [
							'Custom',
						],
					},
				},
			},
			{
				displayName: 'Host',
				name: 'host',
				type: 'string',
				required: false,
				default:'',
				description:'Host of the database',
				displayOptions: {
					hide: {
						odbcType: [
							'Custom',
						],
					},
				},
			},
			{
				displayName: 'Port',
				name: 'port',
				type: 'string',
				default:'',
				required: false,
				description: 'Query to execute',
				displayOptions: {
					hide: {
						odbcType: [
							'Custom',
						],
					},
				},
			},
			{
				displayName: 'Database name',
				name: 'databaseName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					hide: {
						odbcType: [
							'Custom',
						],
					},
				},
			},
			{
				displayName: 'User',
				name: 'user',
				type: 'string',
				required: false,
				default:'',
				description:'User for the database',
				displayOptions: {
					hide: {
						odbcType: [
							'Custom',
						],
					},
				},
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				required: false,
				default:'',
				description:'Password of the database',
				displayOptions: {
					hide: {
						odbcType: [
							'Custom',
						],
					},
				},
			},
			{
				displayName: 'Query',
				name: 'queryStr',
				type: 'string',
				default:'',
				description: 'Query to execute',
			},
		],
	};

	// @ts-ignore
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const driver = this.getNodeParameter('driver', 0) as string;
		const host = this.getNodeParameter('host', 0) as string;
		const user = this.getNodeParameter('user', 0) as string;
		const password = this.getNodeParameter('password', 0) as string;
		const queryStr = this.getNodeParameter('queryStr', 0) as string;
		const port = this.getNodeParameter('port', 0) as string;
		const databaseName = this.getNodeParameter('databaseName', 0) as string;
		const odbcType = this.getNodeParameter('odbcType', 0) as string;
		const connectionStringCustom = this.getNodeParameter('csCustom', 0) as string;

		const odbc = require('odbc');
		let connectionString = '';
		if(odbcType === 'Custom'){
			connectionString = connectionStringCustom;
		}
		else if(odbcType === 'PostgreSQL') {
			connectionString = 'Driver={' + driver + '};Server=' + host;
			if (port != null) {
				connectionString += ';Port=' + port;
			}
			connectionString += ';Database=' + databaseName + '; Uid=' + user + '; Pwd=' + password;
		}
		else if(odbcType === 'SQL Server') {
			connectionString = 'Driver={' + driver + '};Server=' + host;
			if (port != null) {
				connectionString += ',' + port;
			}
			connectionString += ';Database=' + databaseName + '; Uid=' + user + '; Pwd=' + password+';TrustServerCertificate=yes;';
		}
		else if(odbcType === 'HFSQL') {
			connectionString = 'DRIVER={' + driver + '};Server Name=' + host;
			if (port != null) {
				connectionString += ';Server Port=' + port;
			}
			connectionString += ';Database=' + databaseName + '; UID=' + user + '; PWD=' + password+';';
		}
		const pool = await odbc.pool(connectionString);

		const query = queryStr;
		const result = await pool.query(query);
		const returnData: IDataObject = result;
		return [this.helpers.returnJsonArray(returnData)];
	}
}
