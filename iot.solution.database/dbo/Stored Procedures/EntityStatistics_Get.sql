/*******************************************************************
DECLARE @output INT = 0
		,@fieldName				nvarchar(255)
		,@syncDate	DATETIME
EXEC [dbo].[EntityStatistics_Get]
	 @guid				= '2D442AEA-E58B-4E8E-B09B-5602E1AA545A'	
	,@currentDate	= '2020-05-21 06:47:56.890'
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT	
	,@syncDate		= @syncDate		OUTPUT
 SELECT @output status,  @fieldName AS fieldName, @syncDate syncDate  
 
001	SLS-1 10-04-2020 [Nishit Khakhi]	Added Initial Version to Get Entity Statistics
*******************************************************************/

CREATE PROCEDURE [dbo].[EntityStatistics_Get]
(	 @guid				UNIQUEIDENTIFIER	
	,@currentDate		DATETIME			= NULL
	,@invokingUser		UNIQUEIDENTIFIER	= NULL
	,@version			NVARCHAR(10)
	,@output			SMALLINT		  OUTPUT
	,@fieldName			NVARCHAR(255)	  OUTPUT	
	,@syncDate			DATETIME			OUTPUT
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
            SELECT 'EntityStatistics_Get' AS '@procName'
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

		IF OBJECT_ID('tempdb..#Entity') IS NOT NULL BEGIN DROP TABLE #Entity END

		CREATE TABLE #Entity([guid] UNIQUEIDENTIFIER, [building]  UNIQUEIDENTIFIER, [deviceGuid] UNIQUEIDENTIFIER)
		
		INSERT INTO #Entity		
		SELECT EN.[guid], @guid AS [building], E.[guid] 
		FROM dbo.[Device] E (NOLOCK) 
		INNER JOIN dbo.[Entity] EN (NOLOCK) ON E.[entityGuid] = EN.[guid] AND EN.[isDeleted] = 0
		WHERE (EN.[guid] = @guid OR EN.[parentEntityGuid] = @guid)
			AND E.[isDeleted] = 0 

		;WITH CTE_Device
		AS (	SELECT E.[building]
					, COUNT(D.[guid]) AS [totalDevices]
					, SUM(CASE WHEN [isProvisioned] = 1 THEN 1 ELSE 0 END) [connectedDeviceCount] 
					, SUM(CASE WHEN [isProvisioned] = 0 THEN 1 ELSE 0 END) [disconnectedDeviceCount] 
				FROM dbo.[Device] D (NOLOCK) 
				INNER JOIN #Entity E (NOLOCK) ON D.[entityGuid] = E.[guid]
				WHERE D.[isDeleted] = 0
				GROUP BY E.[building]
		)
		, CTE_Alerts
		AS ( SELECT E.[building], COUNT(A.[guid]) AS [totalAlerts]
				, SUM(CASE WHEN A.[severity] = 'High Voltage' THEN 1 ELSE 0 END) AS [totalHighVolt]
				, SUM(CASE WHEN A.[severity] = 'Internal Communication Error' THEN 1 ELSE 0 END) AS [totalInterComError]
				, SUM(CASE WHEN A.[severity] = 'Low Voltage' THEN 1 ELSE 0 END) AS [totalLowVolt]
				, SUM(CASE WHEN A.[severity] = 'Strike Fail' THEN 1 ELSE 0 END) AS [totalStrikeFail]
				, SUM(CASE WHEN A.[severity] = 'Pannel Off' THEN 1 ELSE 0 END) AS [totalPannelOff]
			FROM dbo.[IOTConnectAlert] A (NOLOCK)
			INNER JOIN #Entity E (NOLOCK) ON A.[deviceGuid] = E.[deviceGuid]
			WHERE CONVERT(DATE,[eventDate]) = CONVERT(DATE,GETUTCDATE())
			GROUP BY E.[building]
		)
		, CTE_Maintenance
		AS (	SELECT DM.[entityGuid] AS [entityGuid]
					, CASE WHEN @currentDate >= [startDateTime] AND @currentDate <= [endDateTime]
						THEN 'Under Maintenance'
						ELSE CASE WHEN [startDateTime] < @currentDate AND [endDateTime] < @currentDate 
						THEN 'Completed'
						ELSE 'Scheduled'
						END
						END AS [status]
				FROM dbo.[DeviceMaintenance] DM (NOLOCK) 
				WHERE DM.[entityGuid] = @guid 
					AND [IsDeleted]=0 
			)
		,CTE_EnergyCount
		AS (	SELECT E.[building]
						, SUM([sum]) [energyCount]
				FROM [dbo].[TelemetrySummary_HourWise] T (NOLOCK) 
				INNER JOIN #Entity E (NOLOCK) ON T.[deviceGuid] = E.[deviceGuid]
				WHERE [attribute] = 'currentin'
				GROUP BY E.[building]
		)
		SELECT [guid]
				, ISNULL(D.[totalDevices],0) AS [totalDevices]
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
		FROM [dbo].[Entity] C (NOLOCK) 
		LEFT JOIN CTE_Device D ON C.[guid] = D.[building]
		LEFT JOIN CTE_Alerts A ON C.[guid] = A.[building] 
		LEFT JOIN (SELECT M.[entityGuid], COUNT(1) AS [underMaintenanceCount]
					FROM CTE_Maintenance M 
					WHERE M.[status] IN ('Under Maintenance','Scheduled')
					GROUP BY M.[entityGuid]) CM ON C.[guid] = CM.[entityGuid]
		LEFT JOIN CTE_EnergyCount EC ON C.[guid] = EC.[building]
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