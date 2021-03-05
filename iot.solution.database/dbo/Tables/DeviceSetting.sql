CREATE TABLE [dbo].[DeviceSetting]
(
	[guid] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY, 
    [deviceGuid] UNIQUEIDENTIFIER NOT NULL, 
    [amTime] TIME(0) NULL, 
    [pmTime] TIME(0) NULL, 
    [presenceTime] BIGINT	NULL,
	[intensityOn]  INT  NULL,
	[intensityOff]  INT  NULL,
	[dimming]  INT  NULL,
	[isActive] BIT DEFAULT(1) NOT NULL,
	[isDeleted] BIT DEFAULT(0) NOT NULL,
    [createdBy] UNIQUEIDENTIFIER NULL, 
    [createdDate] DATETIME NULL, 
    [updatedBy] UNIQUEIDENTIFIER NULL, 
    [updatedDate] DATETIME NULL
)
