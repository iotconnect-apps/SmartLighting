CREATE TABLE [dbo].[DeviceMaintenance] (
    [guid]         UNIQUEIDENTIFIER NOT NULL,
    [companyGuid]  UNIQUEIDENTIFIER NOT NULL,
    [entityGuid]   UNIQUEIDENTIFIER NOT NULL,
    [deviceGuid]   UNIQUEIDENTIFIER NOT NULL,
    [description]  NVARCHAR (1000)  NULL,
    [createdDate]  DATETIME         NULL,
    [startDateTime]	   DATETIME NULL, 
	[endDateTime]	   DATETIME NULL, 
    [isDeleted] BIT Default (0) NOT NULL, 
    CONSTRAINT [PK__Device__497F6CB4D51981B3] PRIMARY KEY CLUSTERED ([guid] ASC)
);

