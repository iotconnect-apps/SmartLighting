/*******************************************************************
DECLARE @count INT
     ,@output INT = 0
	,@fieldName					nvarchar(255)
	,@syncDate	DATETIME
EXEC [dbo].[Company_EnergyConsumption]
	@guid	= 'C72E9BBB-FED3-4C14-B396-95177B09AFF6'
	,@frequency = 'W'
	,@invokinguser  = 'E05A4DA0-A8C5-4A4D-886D-F61EC802B5FD'              
	,@version		= 'v1'              
	,@output		= @output		OUTPUT
	,@fieldname		= @fieldName	OUTPUT	
	,@syncDate		= @syncDate		OUTPUT
SELECT @output status, @fieldName fieldName, @syncDate syncDate

001	SL-4 29-04-2020 [Nishit Khakhi]	Added Initial Version to represent Energy consumption by Company
*******************************************************************/
CREATE PROCEDURE [dbo].[Company_EnergyConsumption]
(	@guid				UNIQUEIDENTIFIER		
	,@frequency			CHAR(1)				
	,@invokinguser		UNIQUEIDENTIFIER	= NULL
	,@version			nvarchar(10)              
	,@output			SMALLINT			OUTPUT
	,@fieldname			nvarchar(255)		OUTPUT
	,@syncDate			DATETIME			OUTPUT
	,@culture			nvarchar(10)		= 'en-Us'	
	,@enabledebuginfo	CHAR(1)				= '0'
)
AS
BEGIN
    SET NOCOUNT ON

    IF (@enabledebuginfo = 1)
	BEGIN
        DECLARE @Param XML 
        SELECT @Param = 
        (
            SELECT 'Company_EnergyConsumption' AS '@procName' 
            , CONVERT(nvarchar(MAX),@guid) AS '@guid' 
			, CONVERT(nvarchar(2),@frequency) AS '@frequency' 
			, CONVERT(nvarchar(MAX),@version) AS '@version' 
            , CONVERT(nvarchar(MAX),@invokinguser) AS '@invokinguser' 
            FOR XML PATH('Params')
	    ) 
	    INSERT INTO DebugInfo(data, dt) VALUES(Convert(nvarchar(MAX), @Param), GETUTCDATE())
    END                    
    
    BEGIN TRY  

		DECLARE @dt DATETIME = GETUTCDATE(), @endDate DATETIME

		IF @frequency = 'D'
		BEGIN
			SET @endDate = DATEADD(DAY,-1,@dt)
		END
		ELSE IF @frequency = 'W'
		BEGIN
			SET @endDate = DATEADD(DAY,-7,@dt)
		END
		ELSE
		BEGIN
			SET @endDate = DATEADD(YEAR,-1,@dt)
		END

		;WITH CTE
		AS (
		SELECT *, ROW_NUMBER() OVER (PARTITION BY [building],[zone] ORDER BY [energy] DESC) AS [no]
		FROM
		(
		SELECT E.[name] AS [building], EN.[name] AS [zone], D.[uniqueId], SUM([sum]) AS [energy]
		FROM [Entity] E (NOLOCK)
		INNER JOIN [Entity] EN (NOLOCK) ON E.[guid] = EN.[parentEntityGuid] ANd EN.[isDeleted] = 0
		INNER JOIN [Device] D (NOLOCK) ON EN.[guid] = D.[entityGuid] AND D.[isDeleted] = 0
		INNER JOIN [TelemetrySummary_Hourwise] T (NOLOCK) ON D.[guid] = T.[deviceGuid]
		WHERE E.[companyGuid] = @guid AND E.[isDeleted] = 0 AND T.[date] BETWEEN @endDate AND @dt
		GROUP BY E.[name], EN.[name],D.[uniqueId]
		) A
		)
		SELECT [building], [zone], [energy] FROM CTE 
		WHERE [no] = 1
		ORDER BY [energy] DESC
				
		SET @output = 1
		SET @fieldname = 'Success'   
         SET @syncDate = (SELECT TOP 1 CONVERT(DATETIME,[value]) FROM dbo.[Configuration] (NOLOCK) WHERE [configKey] = 'telemetry-last-exectime') 
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
