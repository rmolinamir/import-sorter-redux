import fs from 'fs';
import { cloneDeep, merge } from 'lodash';
import { sep } from 'path';
import { lastValueFrom } from 'rxjs';
import { delay, map, scan } from 'rxjs/operators';
import {
  Position,
  ProgressLocation,
  Range,
  TextDocument,
  TextDocumentWillSaveEvent,
  TextEdit,
  TextEditorEdit,
  Uri,
  window,
  workspace
} from 'vscode';

import { allowedLanguages } from './core/allowed-languages';
import {
  defaultGeneralConfiguration,
  GeneralConfiguration,
  ImportRunner,
  ImportSorterConfiguration,
  ImportStringConfiguration,
  InMemoryImportCreator,
  InMemoryImportSorter,
  SimpleImportAstParser,
  SimpleImportRunner,
  SortConfiguration
} from './core/core-public';
import { ConfigurationProvider } from './core/import-runner';

const EXTENSION_CONFIGURATION_NAME = 'importSorter';

export class VSCodeConfigurationProvider implements ConfigurationProvider {
  private currentConfiguration!: ImportSorterConfiguration;

  public getConfiguration(): ImportSorterConfiguration {
    return this.currentConfiguration;
  }

  public resetConfiguration() {
    this.currentConfiguration = this._getConfiguration();
  }

  private _getConfiguration() {
    const generalConfigProxy:
      | GeneralConfiguration
      | ProxyHandler<GeneralConfiguration> = workspace
      .getConfiguration(EXTENSION_CONFIGURATION_NAME)
      .get<GeneralConfiguration>('generalConfiguration')!;

    const generalConfig = cloneDeep(generalConfigProxy);

    const [{ uri: { path = workspace.rootPath ?? '' } = {} } = {}] =
      workspace.workspaceFolders || [];

    const configPath = `${path}${sep}${generalConfig.configurationFilePath}`;
    const isConfigInWorkspace = fs.existsSync(configPath);

    if (
      !isConfigInWorkspace &&
      generalConfig.configurationFilePath !==
        defaultGeneralConfiguration.configurationFilePath
    ) {
      const errorMessage =
        'Configuration file not found, the process will continue with the configuration from the settings.';

      console.error(errorMessage, configPath);

      window.showErrorMessage(errorMessage, configPath);
    }

    const fileConfigurationString = isConfigInWorkspace
      ? fs.readFileSync(configPath, 'utf8')
      : '{}';

    const fileConfigJsonObj = JSON.parse(fileConfigurationString);

    const fileConfigMerged = Object.keys(fileConfigJsonObj)
      .map((key) => {
        const total = {};

        const keys = key.split('.').filter((str) => str !== 'importSorter');

        keys.reduce((sum: Record<PropertyKey, object>, currentKey, index) => {
          if (index === keys.length - 1)
            sum[currentKey] = fileConfigJsonObj[key];
          else sum[currentKey] = {};
          return sum[currentKey];
        }, total);

        return total;
      })
      .reduce((sum, currentObj) => merge(sum, currentObj), {});

    const fileConfig = fileConfigMerged as ImportSorterConfiguration;

    const sortConfigProxy: SortConfiguration | ProxyHandler<SortConfiguration> =
      workspace
        .getConfiguration(EXTENSION_CONFIGURATION_NAME)
        .get<SortConfiguration>('sortConfiguration')!;

    const sortConfig = cloneDeep(sortConfigProxy);

    const importStringConfigProxy:
      | ImportStringConfiguration
      | ProxyHandler<ImportStringConfiguration> = workspace
      .getConfiguration(EXTENSION_CONFIGURATION_NAME)
      .get<ImportStringConfiguration>('importStringConfiguration')!;

    const importStringConfig = cloneDeep(importStringConfigProxy);

    const sortConfiguration = merge(
      sortConfig,
      fileConfig.sortConfiguration || {}
    );

    const importStringConfiguration = merge(
      importStringConfig,
      fileConfig.importStringConfiguration || {}
    );

    const generalConfiguration = merge(
      generalConfig,
      fileConfig.generalConfiguration || {}
    );

    return {
      sortConfiguration,
      importStringConfiguration,
      generalConfiguration
    };
  }
}

export class ImportSorterExtension {
  private importRunner!: ImportRunner;

  private configurationProvider!: VSCodeConfigurationProvider;

  public initialize() {
    this.configurationProvider = new VSCodeConfigurationProvider();
    this.importRunner = new SimpleImportRunner(
      new SimpleImportAstParser(),
      new InMemoryImportSorter(),
      new InMemoryImportCreator(),
      this.configurationProvider
    );
  }

  public dispose() {}

  public sortActiveDocumentImportsFromCommand(): void {
    if (
      !window.activeTextEditor ||
      !this.isSortAllowed(window.activeTextEditor.document, false)
    )
      return;

    this.configurationProvider.resetConfiguration();

    return this.sortActiveDocumentImports();
  }

  public sortImportsInDirectories(uri: Uri): Thenable<void> {
    return window.withProgress(
      {
        location: ProgressLocation.Notification,
        title: 'Import Sorter Redux',
        cancellable: false
      },
      async (progress) => {
        this.configurationProvider.resetConfiguration();

        const sortImports$ = this.importRunner.sortImportsInDirectory(
          uri.fsPath
        );

        return lastValueFrom(
          sortImports$.pipe(
            map(() => 1),
            scan((total, increment) => total + increment, 0),
            map((count) => {
              progress.report({
                message: `Sorting ${count} ${count > 1 ? 'files' : 'file'}...`
              });
            }),
            delay(2000)
          )
        );
      }
    );
  }

  public sortModifiedDocumentImportsFromOnBeforeSaveCommand(
    event: TextDocumentWillSaveEvent
  ): void {
    this.configurationProvider.resetConfiguration();

    const configuration = this.configurationProvider.getConfiguration();

    const isSortOnBeforeSaveEnabled =
      configuration.generalConfiguration.sortOnBeforeSave;

    if (!isSortOnBeforeSaveEnabled) return;

    if (!this.isSortAllowed(event.document, true)) return;

    return this.sortActiveDocumentImports(event);
  }

  private sortActiveDocumentImports(event?: TextDocumentWillSaveEvent): void {
    try {
      const doc: TextDocument = event
        ? event.document
        : window.activeTextEditor!.document;

      const text = doc.getText();

      const importData = this.importRunner.getSortImportData(
        doc.uri.fsPath,
        text
      );

      if (!importData.isSortRequired) return;

      const deleteEdits = importData.rangesToDelete?.map((x) =>
        TextEdit.delete(
          new Range(
            new Position(x.startLine, x.startCharacter),
            new Position(x.endLine, x.endCharacter)
          )
        )
      );

      if (event && deleteEdits) {
        const insertEdit = TextEdit.insert(
          new Position(importData.firstLineNumberToInsertText!, 0),
          importData.sortedImportsText + '\n'
        );

        event.waitUntil(Promise.resolve([...deleteEdits, insertEdit]));
      } else {
        window.activeTextEditor?.edit((editBuilder: TextEditorEdit) => {
          deleteEdits?.forEach((x) => {
            editBuilder.delete(x.range);
          });
          editBuilder.insert(
            new Position(importData.firstLineNumberToInsertText!, 0),
            importData.sortedImportsText + '\n'
          );
        });
      }
    } catch (error) {
      window.showErrorMessage(
        `[ERROR] Import Sorter Redux: ${(error as Error).message}`
      );
    }
  }

  private isSortAllowed(
    document: TextDocument,
    isFileExtensionErrorIgnored: boolean
  ): boolean {
    if (!document) return false;

    if (allowedLanguages.some(({ id }) => document.languageId === id))
      return true;

    if (isFileExtensionErrorIgnored) return false;

    window.showErrorMessage(
      'Import Sorter Redux currently only supports the following languages: '
        .concat(
          allowedLanguages
            .map(({ id, fileExtension }) => `${id} (.${fileExtension})`)
            .join(', ')
        )
        .concat('.')
    );

    return false;
  }
}
