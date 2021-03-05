/*******************************************************************
DECLARE @output INT = 0
		,@fieldName				nvarchar(255)
		,@syncDate	DATETIME
EXEC [dbo].[CompanyStatistics_Get]
	 @guid				= '2D442AEA-E58B-4E8E-B09B-5602E1AA545A'
	,@currentDate	= '2020-05-21 06:47:56.890'
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT	
	,@syncDate		= @syncDate		OUTPUT

 SELECT @output status,  @fieldName AS fieldName, @syncDate syncDate  
 
001	SLS-1 10-04-2020 [Nishit Khakhi]	Added Initial Version to Get Company Statistics
*******************************************************************/

CREATE PROCEDURE [dbo].[CompanyStatistics_Get]
(	 @guid				UNIQUEIDENTIFIER	
	,@currentDate		DATETIME			= NULL
	,@invokingUser		UNIQUEIDENTIFIER	= NULL
	,@version			NVARCHAR(10)
	,@output			SMALLINT		  OUTPUT
	,@fieldName			NVARCHAR(255)	  OUTPUT
	,@syncDate			DATETIME		  OUTPUT
	,@culture			NVARCHAR(10)	  = 'en-Us'
	,@enableDebugInfo	CHAR(1)			  = '0'
)
AS
BEGIN
    SET NOCOUNT ON
	IF (@enableDebugInfo = 1)
	BEGIN
        DECLARE @Param XML
        SELECT @Param =
        (
            SELECT 'CompanyStatistics_Get' AS '@procName'
			, CONVERT(nvarchar(MAX),@guid) AS '@guid'	
			, CONVERT(VARCHAR(50),@currentDate) as '@currentDate'
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

    BEGIN TRY
		SET @syncDate = (SELECT TOP 1 CONVERT(DATETIME,[value]) FROM dbo.[Configuration] (NOLOCK) WHERE [configKey] = 'telemetry-last-exectime') 

		;WITH CTE_Facilities
		AS (	SELECT [companyGuid], SUM(CASE WHEN [parentEntityGuid] IS NULL THEN 1 ELSE 0 END) [totalParent]
					FROM [dbo].[Entity] (NOLOCK) 
				WHERE [companyGuid] = @guid AND [isDeleted] = 0 
				 and [Guid] not in (select entityGuid from [dbo].[Company] where [Guid]=@guid) 
				GROUP BY [companyGuid]
		)
		, CTE_Device
		AS (	SELECT [companyGuid]
					, COUNT(D.[guid]) AS [totalDevices]
					, SUM(CASE WHEN [isProvisioned] = 1 THEN 1 ELSE 0 END) [connectedDeviceCount] 
					, SUM(CASE WHEN [isProvisioned] = 0 THEN 1 ELSE 0 END) [disconnectedDeviceCount] 
				FROM dbo.[Device] D (NOLOCK) WHERE D.[companyGuid] = @guid AND D.[isDeleted] = 0
				GROUP BY [companyGuid]
		)
		,CTE_UserCount
		AS (	SELECT [companyGuid]
		                , COUNT(1) [totalUserCount]
						, SUM(CASE WHEN [isActive] = 1 THEN 1 ELSE 0 END) [activeUserCount] 
						, SUM(CASE WHEN [isActive] = 0 THEN 1 ELSE 0 END) [inactiveUserCount] 
				FROM [dbo].[User] (NOLOCK) 
				WHERE [companyGuid] = @guid AND [isDeleted] = 0
				GROUP BY [companyGuid]
		)
		, CTE_Alerts
		AS ( SELECT [companyGuid], COUNT(A.[guid]) AS [totalAlerts]
		, SUM(CASE WHEN A.[severity] = 'High Voltage' THEN 1 ELSE 0 END) AS [totalHighVolt]
		, SUM(CASE WHEN A.[severity] = 'Internal Communication Error' THEN 1 ELSE 0 END) AS [totalInterComError]
		, SUM(CASE WHEN A.[severity] = 'Low Voltage' THEN 1 ELSE 0 END) AS [totalLowVolt]
		, SUM(CASE WHEN A.[severity] = 'Strike Fail' THEN 1 ELSE 0 END) AS [totalStrikeFail]
		, SUM(CASE WHEN A.[severity] = 'Pannel Off' THEN 1 ELSE 0 END) AS [totalPannelOff]
		FROM dbo.[IOTConnectAlert] A (NOLOCK) 
		WHERE A.[companyGuid] = @guid AND CONVERT(DATE,[eventDate]) = CONVERT(DATE,GETUTCDATE())
		GROUP BY [companyGuid]
		)
		, CTE_Maintenance
		AS (	SELECT DM.[companyGuid] AS [companyGuid]
					, CASE WHEN @currentDate >= [startDateTime] AND @currentDate <= [endDateTime]
						THEN 'Under Maintenance'
						ELSE CASE WHEN [startDateTime] < @currentDate AND [endDateTime] < @currentDate 
						THEN 'Completed'
						ELSE 'Scheduled'
						END
						END AS [status]
				FROM dbo.[DeviceMaintenance] DM (NOLOCK) 
				WHERE DM.[companyGuid] = @guid 
					AND [IsDeleted]=0 
			)
		,CTE_EnergyCount
		AS (	SELECT E.[companyGuid]
						, SUM([sum]) [energyCount]
				FROM [dbo].[TelemetrySummary_Hourwise] T (NOLOCK) 
				INNER JOIN [dbo].[Device] E (NOLOCK) ON T.[deviceGuid] = E.[guid]
				WHERE E.[companyGuid] = @guid AND [attribute] = 'currentin'
				GROUP BY E.[companyGuid]
		)
		SELECT [guid]
				, ISNULL(L.[totalParent],0) AS [totalEntities]
				, ISNULL(D.[totalDevices],0) AS [totalDevices]
				, ISNULL(D.[totalDevices],0) - ISNULL(CM.[underMaintenanceCount],0)  AS [totalRunning]
				, ISNULL(D.[connectedDeviceCount],0) AS [connectedDeviceCount]
				, ISNULL(D.[disconnectedDeviceCount],0) AS [disconnectedDeviceCount]
				, ISNULL(CM.[underMaintenanceCount],0) AS [totalUnderMaintenanceCount]
				, ISNULL(EC.[energyCount],0) AS [energyCount]
				, ISNULL(A.[totalAlerts],0) AS [totalAlerts]
				, ISNULL(A.[totalHighVolt],0) AS [totalHighVolt]
				, ISNULL(A.[totalInterComError],0) AS [totalInterComError]
				, ISNULL(A.[totalLowVolt],0) AS [totalLowVolt]
				, ISNULL(A.[totalPannelOff],0) AS [totalPannelOff]
				, ISNULL(A.[totalStrikeFail],0) AS [totalStrikeFail]
					, ISNULL( U.[activeUserCount],0) AS [activeUserCount]
				, ISNULL( U.[inactiveUserCount],0) AS [inactiveUserCount]
				, ISNULL( U.[totalUserCount],0) AS [totalUserCount]
		
		FROM [dbo].[Company] C (NOLOCK) 
		LEFT JOIN CTE_Facilities L ON C.[guid] = L.[companyGuid]
		LEFT JOIN CTE_Device D ON C.[guid] = D.[companyGuid]
		LEFT JOIN CTE_Alerts A ON C.[guid] = A.[companyGuid] 
			LEFT JOIN CTE_UserCount U ON C.[guid] = U.[companyGuid]
	
		LEFT JOIN (SELECT M.[companyGuid], COUNT(1) AS [underMaintenanceCount]
					FROM CTE_Maintenance M 
					WHERE M.[status] IN ('Under Maintenance','Scheduled')
					GROUP BY M.[companyGuid]) CM ON C.[guid] = CM.[companyGuid]
		LEFT JOIN CTE_EnergyCount EC ON C.[guid] = EC.[companyGuid]
		WHERE C.[guid]=@guid AND C.[isDeleted]= 0
		
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