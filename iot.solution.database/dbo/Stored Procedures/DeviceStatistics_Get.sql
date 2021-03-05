/*******************************************************************
DECLARE @output INT = 0
		,@fieldName				nvarchar(255)
		
EXEC [dbo].[DeviceStatistics_Get]
	 @guid				= 'FE6876FE-A5A5-4AB8-8ABD-B15DFE8B55FB'
	,@currentDate	= '2020-05-21 06:47:56.890'
	,@invokingUser  	= '7D31E738-5E24-4EA2-AAEF-47BB0F3CCD41'
	,@version			= 'v1'
	,@output			= @output		OUTPUT
	,@fieldName			= @fieldName	OUTPUT	
        
 SELECT @output status,  @fieldName AS fieldName   
 
 001 SL-4 11-05-2020 [Nishit Khakhi]	Added Initial Version to Get Device Statistics
*******************************************************************/
CREATE PROCEDURE [dbo].[DeviceStatistics_Get]
(	 @guid				UNIQUEIDENTIFIER	
	,@currentDate		DATETIME			= NULL
	,@invokingUser		UNIQUEIDENTIFIER	= NULL
	,@version			NVARCHAR(10)
	,@output			SMALLINT		  OUTPUT
	,@fieldName			NVARCHAR(255)	  OUTPUT
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
            SELECT 'DeviceStatistics_Get' AS '@procName'
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
		DECLARE @uniqueId NVARCHAR(500)

		SELECT TOP 1 @uniqueId = [uniqueId] FROM dbo.[Device] (NOLOCK) WHERE [guid] = @guid AND [isDeleted] = 0

		SELECT E.[uniqueId]
			, EM.[startDateTime]
			--, CASE WHEN [startDate] IS NOT NULL
			--	 AND [startDate] > GETUTCDATE() 
			--	 THEN 
			--		ISNULL(DATEDIFF(DD
			--		,GETUTCDATE()
			--		,[startDate]),0)
			--  ELSE 0
			--  END AS [day]
			--, CASE WHEN [startDate] IS NOT NULL 
			--	AND [startDate] > GETUTCDATE() 
			--	THEN 
			--		ISNULL(DATEDIFF(HH
			--		,GETUTCDATE()
			--		,[startDate])%24,0) 
			--  ELSE 0
			--  END AS [hour]
			--, CASE WHEN [startDate] IS NOT NULL 
			--	AND [startDate] > GETUTCDATE() 
			--	THEN 
			--		ISNULL(DATEDIFF(MINUTE
			--			,GETUTCDATE()
			--			,[startDate])%60,0) 
			--  ELSE 0
			--  END AS [minute]
		FROM [dbo].[Device] E (NOLOCK) 
		LEFT JOIN dbo.[DeviceMaintenance] EM (NOLOCK) ON E.[guid] = EM.[deviceGuid] AND EM.[isDeleted] = 0 
		WHERE E.[guid] = @guid AND E.[isDeleted]=0 AND [startDateTime] >= @currentDate


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
