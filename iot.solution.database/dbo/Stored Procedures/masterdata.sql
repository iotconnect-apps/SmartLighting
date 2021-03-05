IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'db-version')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'cf45da4c-1b49-49f5-a5c3-8bc29c1999ea', N'db-version', N'0', 0, CAST(N'2020-04-08T13:16:53.940' AS DateTime), NULL, CAST(N'2020-04-08T13:16:53.940' AS DateTime), NULL)
END

IF NOT EXISTS (SELECT TOP 1 1 FROM dbo.[configuration] WHERE [configKey] = 'telemetry-last-exectime')
BEGIN
	INSERT [dbo].[Configuration] ([guid], [configKey], [value], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'465970b2-8bc3-435f-af97-8ca26f2bf383', N'telemetry-last-exectime', N'2020-02-08 12:08:02.380', 0, CAST(N'2020-02-25T06:41:01.030' AS DateTime), NULL, CAST(N'2020-02-25T06:41:01.030' AS DateTime), NULL)
END
IF (SELECT TOP 1 CONVERT(INT,[value]) FROM dbo.[configuration] WHERE [configKey] = 'db-version') < 1 
BEGIN

INSERT [dbo].[KitType] ([guid], [companyGuid], [name], [code], [tag], [isActive], [isDeleted], [createdDate], [createdBy], [updatedDate], [updatedBy]) VALUES (N'92ff19d0-8863-4142-a19c-9a74d6f9353d', N'b811b983-9448-4021-9978-6c699404eb81', N'Default', N'Default', N'base', 1, 0, CAST(N'2020-02-25T11:58:30.127' AS DateTime), N'6ba9cad3-c112-44df-9490-74292f7ed5b5', NULL, NULL)
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'fb04002d-d5a2-46ba-b76b-0cac9c21f8f8', NULL, N'92ff19d0-8863-4142-a19c-9a74d6f9353d', N'voltage', N'voltage', N'', N'voltage')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'0247967d-ab14-43a4-9e89-0df7abf59da4', NULL, N'92ff19d0-8863-4142-a19c-9a74d6f9353d', N'brightness', N'brightness', NULL, N'brightness')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'1990bf7d-9612-431e-b103-0fc10e41e807', NULL, N'92ff19d0-8863-4142-a19c-9a74d6f9353d', N'intensity', N'intensity', NULL, N'intensity')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'fa41936f-e933-4cff-94f2-109bbed6e082', NULL, N'92ff19d0-8863-4142-a19c-9a74d6f9353d', N'status', N'status', NULL, N'status')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'03d1c395-dd2d-4d9d-bfc7-256c056c28d7', NULL, N'92ff19d0-8863-4142-a19c-9a74d6f9353d', N'occupancy', N'occupancy', N'', N'occupancy')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'7815d2b1-fd45-4201-8b68-344ed1b8d8dd', NULL, N'92ff19d0-8863-4142-a19c-9a74d6f9353d', N'currentin', N'currentin', N'', N'currentin')
INSERT [dbo].[KitTypeAttribute] ([guid], [parentTemplateAttributeGuid], [templateGuid], [localName], [code], [tag], [description]) VALUES (N'91d71c91-e2bf-4287-9c50-9bb5a47c5d46', NULL, N'92ff19d0-8863-4142-a19c-9a74d6f9353d', N'photoelectric', N'photoelectric', N'', N'photoelectric')
INSERT INTO [dbo].[AdminUser] ([guid],[email],[companyGuid],[firstName],[lastName],[password],[isActive],[isDeleted],[createdDate]) VALUES (NEWID(),'admin@elevator.com','AB469212-2488-49AD-BC94-B3A3F45590D2','Lighting','admin','Softweb#123',1,0,GETUTCDATE())

UPDATE [dbo].[Configuration]
SET [value]  = '1'
WHERE [configKey] = 'db-version'

END