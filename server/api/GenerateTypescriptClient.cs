using NJsonSchema.CodeGeneration.TypeScript;
using NSwag;
using NSwag.CodeGeneration.TypeScript;
using NSwag.Generation;

namespace api;

public static class GeneratetypescriptClient
{
    public static async Task GenerateApiClientsFromOpenApi(this WebApplication app, string path)
    {
        // Step 1: Generate OpenAPI document with full documentation
        var document = await app.Services.GetRequiredService<IOpenApiDocumentGenerator>()
            .GenerateAsync("v1");

        // Step 2: Serialize the document to JSON to verify it contains documentation
        var openApiJson = document.ToJson();

        // Optional: Save the OpenAPI JSON to verify it has documentation
        var openApiPath = Path.Combine(Directory.GetCurrentDirectory(), "openapi-with-docs.json");
        await File.WriteAllTextAsync(openApiPath, openApiJson);

        // Step 3: Parse the document back from JSON to ensure we're only using what's in the OpenAPI spec
        var documentFromJson = await OpenApiDocument.FromJsonAsync(openApiJson);

        // Step 4: Generate TypeScript client from the parsed OpenAPI document
        var settings = new TypeScriptClientGeneratorSettings
        {
            Template = TypeScriptTemplate.Fetch,
            TypeScriptGeneratorSettings =
            {
                TypeStyle = TypeScriptTypeStyle.Interface,
                DateTimeType = TypeScriptDateTimeType.String,
                NullValue = TypeScriptNullValue.Undefined,
                TypeScriptVersion = 5.2m,
                GenerateCloneMethod = false,
                MarkOptionalProperties = false,
                GenerateConstructorInterface = true,
                ConvertConstructorInterfaceData = true,
            }
        };

        var generator = new TypeScriptClientGenerator(documentFromJson, settings);
        var code = generator.GenerateFile();

        var outputPath = Path.Combine(Directory.GetCurrentDirectory() + path);
        Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);

        await File.WriteAllTextAsync(outputPath, code);

// FIX: static types cannot be used as type arguments → use ILogger<object>
        var logger = app.Services.GetRequiredService<ILogger<object>>();

        logger.LogInformation("OpenAPI JSON with documentation saved at: " + openApiPath);
        logger.LogInformation("TypeScript client generated at: " + outputPath);
    }
}
