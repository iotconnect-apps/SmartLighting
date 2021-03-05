/*******************************************************************
DECLARE @count INT
     	,@output INT = 0
		,@fieldName	VARCHAR(255)

EXEC [dbo].[Device_List]
	 @companyGuid	= '895019CF-1D3E-420C-828F-8971253E5784'
	,@entityGuid	= '895019CF-1D3E-420C-828F-8971253E5784'
	,@isParent		= 1		
	,@pageSize		= 10
	,@pageNumber	= 1
	,@orderby		= NULL
	,@count			= @count OUTPUT
	,@invokingUser  = 'C1596B8C-7065-4D63-BFD0-4B835B93DFF2'
	,@version		= 'v1'
	,@output		= @output	OUTPUT
	,@fieldName		= @fieldName	OUTPUT

SELECT @count count, @output status, @fieldName fieldName

001	SGH-1 05-12-2019 [Nishit Khakhi]	Added Initial Version to List Device
002	SGH-1 16-12-2019 [Nishit Khakhi]	Added isParent Flag to Device list for getting parent Device data
003	SGH-1 20-12-2019 [Nishit Khakhi]	Updated Parent flag condition to give only child data when it pass as zero
004	SGH-1 30-12-2019 [Nishit Khakhi]	Added Location Name, Count of Devices
*******************************************************************/
Create PROCEDURE [dbo].[Device_List]  
( @companyGuid  UNIQUEIDENTIFIER  
 ,@entityGuid  UNIQUEIDENTIFIER = NULL  
 ,@isParent   BIT     = 0  
 ,@search   VARCHAR(100)  = NULL  
 ,@pageSize   INT  
 ,@pageNumber  INT  
 ,@orderby   VARCHAR(100)  = NULL  
 ,@invokingUser  UNIQUEIDENTIFIER  
 ,@version   VARCHAR(10)  
 ,@culture   VARCHAR(10)   = 'en-Us'  
 ,@output   SMALLINT   OUTPUT  
 ,@fieldName   VARCHAR(255)  OUTPUT  
 ,@count    INT OUTPUT  
 ,@enableDebugInfo  CHAR(1)   = '0'  
)  
AS  
BEGIN  
   SET NOCOUNT ON  
  
    IF (@enableDebugInfo = 1)  
 BEGIN  
        DECLARE @Param XML  
        SELECT @Param =  
        (  
            SELECT 'Device_List' AS '@procName'  
             , CONVERT(VARCHAR(MAX),@companyGuid) AS '@companyGuid'  
             , CONVERT(VARCHAR(MAX),@search) AS '@search'  
    , CONVERT(VARCHAR(MAX),@pageSize) AS '@pageSize'  
    , CONVERT(VARCHAR(MAX),@pageNumber) AS '@pageNumber'  
    , CONVERT(VARCHAR(MAX),@orderby) AS '@orderby'  
    , CONVERT(VARCHAR(MAX),@version) AS '@version'  
             , CONVERT(VARCHAR(MAX),@invokingUser) AS '@invokingUser'  
            FOR XML PATH('Params')  
     )  
     INSERT INTO DebugInfo(data, dt) VALUES(Convert(VARCHAR(MAX), @Param), GETDATE())  
    END  
      
    BEGIN TRY  
  
  SELECT  
   @output = 1  
  ,@count = -1  
  
  IF OBJECT_ID('tempdb..#temp_Device') IS NOT NULL DROP TABLE #temp_Device  
  
  CREATE TABLE #temp_Device  
  ( [guid]    UNIQUEIDENTIFIER  
   ,[companyGuid]  UNIQUEIDENTIFIER  
   ,[entityGuid]  UNIQUEIDENTIFIER  
   ,[entityName]  NVARCHAR(500)  
   ,[zoneType] NVARCHAR(100) 
   ,[subEntityName]  NVARCHAR(500)  
   ,[templateGuid]  UNIQUEIDENTIFIER  
   ,[parentDeviceGuid] UNIQUEIDENTIFIER  
   ,[typeGuid]   UNIQUEIDENTIFIER  
   ,[uniqueId]   NVARCHAR(500)  
   ,[name]    NVARCHAR(500)  
   ,[note]    NVARCHAR(1000)  
   ,[tag]    NVARCHAR(50)  
   ,[capacity]   INT  
   ,[image]   NVARCHAR(200)  
   ,[isProvisioned] BIT  
   ,[isActive]   BIT  
   ,[count]   BIGINT  
   ,[status]   NVARCHAR(10)  
   ,[rowNum]   INT  
  )  
  
  IF LEN(ISNULL(@orderby, '')) = 0  
  SET @orderby = 'name asc'  
  
  DECLARE @Sql nvarchar(MAX) = ''  
  
  SET @Sql = '  
  SELECT  
   *  
   ,ROW_NUMBER() OVER (ORDER BY '+@orderby+') AS rowNum  
  FROM  
  ( SELECT  
   D.[guid]  
   , D.[companyGuid]  
   , D.[entityGuid]  
   , EP.[name] AS [entityName]
   ,G.[type] AS [zoneType]
   , G.[name] AS [subEntityName]  
   , D.[templateGuid]  
   , D.[parentDeviceGuid]  
   , D.[typeGuid]  
   , D.[uniqueId]  
   , D.[name]  
   , D.[note]  
   , D.[tag]  
   , D.[capacity]  
   , D.[image]  
   , D.[isProvisioned]  
   , D.[isActive]  
   , 0 AS [count]  
   , '''' AS [status]  
   FROM [dbo].[Device] D WITH (NOLOCK)   
   INNER JOIN [dbo].[Entity] G WITH (NOLOCK) ON D.[entityGuid] = G.[guid] AND G.[isDeleted] = 0  
   LEFT JOIN [dbo].[Entity] EP WITH (NOLOCK) ON G.[parentEntityGuid] = EP.[guid] AND EP.[isDeleted] = 0   
    WHERE D.[companyGuid]=@companyGuid AND D.[isDeleted]=0 '  
   + CASE WHEN @entityGuid IS NOT NULL THEN ' AND entityGuid = @entityGuid ' ELSE '' END +  
   + CASE WHEN @isParent = 0 THEN ' AND parentDeviceGuid IS NOT NULL ' ELSE  
   ' AND parentDeviceGuid IS NULL ' END +  
    + CASE WHEN @search IS NULL THEN '' ELSE  
   ' AND (D.name LIKE ''%' + @search + '%''  
     OR D.[uniqueId] LIKE ''%' + @search + '%''   
     OR G.[name] LIKE ''%' + @search + '%''   
     OR EP.[name] LIKE ''%' + @search + '%''  
	 OR G.[type] LIKE ''%' + @search + '%''
   )'  
    END +  
  ' )  data '  
    
  INSERT INTO #temp_Device  
  EXEC sp_executesql   
     @Sql  
   , N'@orderby VARCHAR(100), @companyGuid UNIQUEIDENTIFIER, @entityGuid UNIQUEIDENTIFIER '  
   , @orderby  = @orderby     
   , @companyGuid = @companyGuid   
   , @entityGuid = @entityGuid  
     
  SET @count = @@ROWCOUNT  
  
  IF @isParent = 1  
  BEGIN  
   ;WITH CTEDATA  
   AS   
   ( SELECT d.[parentDeviceGuid],COUNT(*) [totalDevice] FROM [Device] D  
    INNER JOIN #temp_Device t ON D.[parentDeviceGuid] = t.[Guid]  
    GROUP BY d.[parentDeviceGuid]  
   )  
   UPDATE t  
   SET [count] = c.[totalDevice]  
   FROM #temp_Device t INNER JOIN CTEDATA c ON t.[guid] = c.[parentDeviceGuid]  
  
  END  
    
  ;WITH CTE_DeviceStatus  
  AS ( SELECT T.[guid]  
     , CASE WHEN CONVERT(TINYINT,I.[attributeValue]) = 1 THEN 'On' Else 'Off' END AS [status]  
     , ROW_NUMBER () OVER (PARTITION BY I.[uniqueId],[localName] ORDER BY [createdDate] DESC) AS [no]  
    FROM #temp_Device T  
    LEFT JOIN [IOTConnect].[AttributeValue] I (NOLOCK)    
     ON T.[companyGuid] = I.[companyGuid] AND T.[uniqueId] = I.[uniqueId]  
     WHERE I.[localName] = 'status'  
  )  
  UPDATE t  
   SET [status] = c.[status]  
   FROM #temp_Device t INNER JOIN CTE_DeviceStatus c ON T.[guid] = c.[guid] AND c.[no] = 1  
  
  IF(@pageSize <> -1 AND @pageNumber <> -1)  
   BEGIN  
    SELECT   
     D.[guid]  
     , D.[companyGuid]  
     , D.[entityGuid]  
     , D.[entityName] 
	 ,D.[zoneType]
     ,D.[subEntityName]  
     , D.[templateGuid]  
     , D.[parentDeviceGuid]  
     , D.[typeGuid]  
     , D.[uniqueId]  
     , D.[name]  
     , D.[note]  
     , D.[tag]  
     , D.[capacity]  
     , D.[image]  
     , D.[isProvisioned]  
     , D.[isActive]  
     , D.[status]  
     , D.[count]       
    FROM #temp_Device D  
    WHERE rowNum BETWEEN ((@pageNumber - 1) * @pageSize) + 1 AND (@pageSize * @pageNumber)     
   END  
  ELSE  
   BEGIN  
    SELECT   
     D.[guid]  
     , D.[companyGuid]  
     , D.[entityGuid]  
     , D.[entityName]  
	 ,D.[zoneType]
     ,D.[subEntityName]  
     , D.[templateGuid]  
     , D.[parentDeviceGuid]  
     , D.[typeGuid]  
     , D.[uniqueId]  
     , D.[name]  
     , D.[note]  
     , D.[tag]  
     , D.[capacity]  
     , D.[image]  
     , D.[isProvisioned]  
     , D.[isActive]   
     , D.[status]  
     , D.[count]      
    FROM #temp_Device D  
   END  
      
        SET @output = 1  
  SET @fieldName = 'Success'  
 END TRY   
 BEGIN CATCH   
  DECLARE @errorReturnMessage VARCHAR(MAX)  
  
  SET @output = 0  
  
  SELECT @errorReturnMessage =   
   ISNULL(@errorReturnMessage, '') +  SPACE(1)   +   
   'ErrorNumber:'  + ISNULL(CAST(ERROR_NUMBER() as VARCHAR), '')  +   
   'ErrorSeverity:'  + ISNULL(CAST(ERROR_SEVERITY() as VARCHAR), '') +   
   'ErrorState:'  + ISNULL(CAST(ERROR_STATE() as VARCHAR), '') +   
   'ErrorLine:'  + ISNULL(CAST(ERROR_LINE () as VARCHAR), '') +   
   'ErrorProcedure:'  + ISNULL(CAST(ERROR_PROCEDURE() as VARCHAR), '') +   
   'ErrorMessage:'  + ISNULL(CAST(ERROR_MESSAGE() as VARCHAR(max)), '')  
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