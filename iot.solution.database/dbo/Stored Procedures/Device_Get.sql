
/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName				nvarchar(255)
EXEC [dbo].[Device_Get]
	 @guid				= 'E9F77DD4-78BC-4461-9D00-64D927998ABE'	
	,@companyGuid		= '895019CF-1D3E-420C-828F-8971253E5784'	
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT	
               
 SELECT @output status,  @fieldName AS fieldName    
 
 001	sgh-1 06-12-2019 [Nishit Khakhi]	Added Initial Version to Get Device Information
*******************************************************************/

CREATE PROCEDURE [dbo].[Device_Get]
(	 
	 @guid				UNIQUEIDENTIFIER	
	,@companyGuid		UNIQUEIDENTIFIER
	,@invokingUser		UNIQUEIDENTIFIER
	,@version			NVARCHAR(10)
	,@output			SMALLINT		  OUTPUT
	,@fieldName			NVARCHAR(255)	  OUTPUT	
	,@culture			NVARCHAR(10)	  = 'en-Us'
	,@enableDebugInfo	CHAR(1)			  = '0'
)
AS
BEGIN
    SET NOCOUNT ON
	DECLARE @orderBy VARCHAR(10)
    IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'Device_Get' AS '@procName'
			, CONVERT(nvarchar(MAX),@guid) AS '@guid'			
			, CONVERT(nvarchar(MAX),@companyGuid) AS '@companyGuid'
            , CONVERT(nvarchar(MAX),@invokingUser) AS '@invokingUser'
			, CONVERT(nvarchar(MAX),@version) AS '@version'
			, CONVERT(nvarchar(MAX),@output) AS '@output'
            , CONVERT(nvarchar(MAX),@fieldName) AS '@fieldName'
            FOR XML PATH('Params')
	    )
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), GETUTCDATE())
    END
    Set @output = 1
    SET @fieldName = 'Success'

    IF NOT EXISTS (SELECT TOP 1 1 FROM [dbo].[Device] (NOLOCK) WHERE [companyGuid]=@companyGuid AND [guid]=@guid AND [isDeleted]=0)
	BEGIN
		Set @output = -3
		SET @fieldName = 'DeviceNotFound'
		RETURN;
	END
  
    BEGIN TRY
		;WITH CTE_DeviceStatus
		AS (	SELECT I.[uniqueId]
					, CASE WHEN CONVERT(TINYINT,I.[attributeValue]) = 1 THEN 'On' Else 'Off' END AS [status]
					, ROW_NUMBER () OVER (PARTITION BY I.[uniqueId],[localName] ORDER BY I.[createdDate] DESC) AS [no]
				FROM [dbo].[Device] D (NOLOCK)
				INNER JOIN [IOTConnect].[AttributeValue] I (NOLOCK) On D.[uniqueId] = I.[uniqueId] 
				WHERE D.[companyGuid] = @companyGuid AND D.[guid] = @guid AND D.[isDeleted] = 0 AND I.[localName] = 'status'
		)
		SELECT D.[guid]
				,D.[companyGuid]
				,D.[entityGuid]
				,EP.[name] AS [entityName]
				,E.[name] AS [subEntityName]
				,D.[templateGuid]
				,(SELECT TOP 1 name FROM dbo.[KitType] DS (NOLOCK) WHERE DS.[isDeleted] = 0) AS [templateName]
				,D.[parentDeviceGuid]
				,D.[typeGuid]
				,D.[uniqueId]
				,D.[name]
				,D.[note]
				,D.[tag]
				,D.[capacity]
				,D.[image]
				,D.[isProvisioned]
				,(SELECT TOP 1 1 FROM dbo.[DeviceSetting] DS (NOLOCK) WHERE DS.[deviceGuid] = D.[guid] AND ISNULL(DS.[presenceTime],0) > 0 AND DS.[isDeleted] = 0) AS [presenceFlag]
				,(SELECT TOP 1 1 FROM dbo.[DeviceSetting] DS (NOLOCK) WHERE DS.[deviceGuid] = D.[guid] AND (ISNULL(DS.[intensityOn],0) > 0 OR ISNULL(DS.[intensityOff],0) > 0) AND DS.[isDeleted] = 0) AS [intensityFlag]
				,IsNULL((SELECT TOP 1 1 FROM dbo.[DeviceSetting] DS (NOLOCK) WHERE DS.[deviceGuid] = D.[guid] AND (DS.[amTime] IS NOT NULL OR DS.[pmTime] IS NOT NULL) and (DS.[amTime]!='00:00:00' and DS.[pmTime]!='00:00:00') AND DS.[isDeleted] = 0),0) AS [scheduledFlag]
				,D.[isActive]
				,D.[createdDate]
				,D.[createdBy]
				,D.[updatedDate]
				,D.[updatedBy]
				,ISNULL(C.[status] ,'') AS [status]
		FROM [dbo].[Device] D (NOLOCK)
		--LEFT JOIN dbo.[KitType] KT (NOLOCK) ON D.[templateGuid] = KT.[guid] AND KT.[isDeleted] = 0
		LEFT JOIN dbo.[Entity] E (NOLOCK) ON D.[entityGuid] = E.[guid] AND E.[isDeleted] = 0
		LEFT JOIN dbo.[Entity] EP (NOLOCK) ON E.[parentEntityGuid] = EP.[guid] AND EP.[isDeleted] = 0
		LEFT JOIN CTE_DeviceStatus C ON D.[uniqueId] = C.[uniqueId] AND C.[no] = 1
		WHERE D.[companyGuid]=@companyGuid AND D.[guid]=@guid AND D.[isDeleted]=0

	END TRY
	BEGIN CATCH
		DECLARE @errorReturnMessage nvarchar(MAX)

		SET @output = 0

		SELECT @errorReturnMessage =
			ISNULL(@errorReturnMessage, '') +  SPACE(1)   +
			'ErrorNumber:'  + ISNULL(CAST(ERROR_NUMBER() as nvarchar), '')  +
			'ErrorSeverity:'  + ISNULL(CAST(ERROR_SEVERITY() as nvarchar), '') +
			'ErrorState:'  + ISNULL(CAST(ERROR_STATE() as nvarchar), '') +
			'ErrorLine:'  + ISNULL(CAST(ERROR_LINE () as nvarchar), '') +
			'ErrorProcedure:'  + ISNULL(CAST(ERROR_PROCEDURE() as nvarchar), '') +
			'ErrorMessage:'  + ISNULL(CAST(ERROR_MESSAGE() as nvarchar(max)), '')
		RAISERROR (@errorReturnMessage, 11, 1)

		IF (XACT_STATE()) = -1
		BEGIN
			ROLLBACK TRANSACTION
		END
		IF (XACT_STATE()) = 1
		BEGIN
			ROLLBACK TRANSACTION
		END
		RAISERROR (@errorReturnMessage, 11, 1)
	END CATCH
END