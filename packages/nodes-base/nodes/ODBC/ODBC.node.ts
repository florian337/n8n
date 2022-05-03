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
				displayName: 'Driver',
				name: 'driver',
				type: 'string',
				required: true,
				default:'',
				description:'Driver of the database',
			},
			{
				displayName: 'ODBC Type',
				name: 'odbcType',
				type: 'options',
				options: [
					{
						name: 'PostgreSQL',
						value: 'PostgreSQL',
					},
					{
						name: 'SQL Server',
						value: 'SQL Server',
					},
				],
				default: 'SQL Server',
				required: true,
				description: 'The ODBC to use',
			},
			{
				displayName: 'Host',
				name: 'host',
				type: 'string',
				required: true,
				default:'',
				description:'Host of the database',
			},
			{
				displayName: 'Port',
				name: 'port',
				type: 'string',
				default:'',
				required: false,
				description: 'Query to execute',
			},
			{
				displayName: 'Database name',
				name: 'databaseName',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'User',
				name: 'user',
				type: 'string',
				required: true,
				default:'',
				description:'User for the database',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				required: true,
				default:'',
				description:'Password of the database',
			},
			{
				displayName: 'Query Type',
				name: 'query',
				type: 'options',
				options: [
					{
						name: 'Execute Query',
						value: 'Execute Query',
					},
				],
				default: 'Execute Query',
				required: true,
				description: 'Query to execute',
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
		const queryType = this.getNodeParameter('query', 0) as string;
		const queryStr = this.getNodeParameter('queryStr', 0) as string;
		const port = this.getNodeParameter('port', 0) as string;
		const databaseName = this.getNodeParameter('databaseName', 0) as string;
		const odbcType = this.getNodeParameter('odbcType', 0) as string;

		const odbc = require('odbc');
		let connectionString = '';
		if(odbcType === 'PostgreSQL') {
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
		const pool = await odbc.pool(connectionString);

		if (queryType === 'Execute Query') {
			const query = queryStr;
			const result = await pool.query(query);
			const returnData: IDataObject = result;
			return [this.helpers.returnJsonArray(returnData)];
		}
	}
}
