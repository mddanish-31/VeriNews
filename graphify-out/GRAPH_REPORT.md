# Graph Report - VeriNews  (2026-11-10)

## Corpus Check
- 107 files · ~236,619 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 4, .csv 4, .ini 2)

## Summary
- 1082 nodes · 2198 edges · 61 communities (45 shown, 16 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 157 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d9247055`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Record
- routes.py
- CanonicalLabel
- package.json
- App.tsx
- project-tracker-data.server.ts
- test_p14_hardening.py
- test_database.py
- DatasetSchema
- test_pipeline.py
- audit_indic_zenodo_hindi.py
- test_calibration_and_explainability.py
- test_quality.py
- re
- test_frontend_integration.py
- run_p11_calibration_and_explainability.py
- json
- compilerOptions
- update_project_tracker.mjs
- test_predict.py
- validate_project_tracker.mjs
- RecordValidator
- readers.py
- ml/__init__.py
- activate_maintenance_mode.mjs
- ModelService
- verify_b06_investigation.mjs
- verify_e2e_full_browser.mjs
- test_verify.py
- detect_script_and_language
- get_url
- Settings
- session.py
- numpy
- .get_candidate_baseline_artifacts
- .load_calibrated_pipeline
- test_pipeline.py
- Any
- verify_e2e_english_website.mjs
- verify_e2e_browser_inference.mjs
- verify_mvp_runtime.mjs
- test_frontend_api_integration.mjs
- url_extractor.py
- verify_news
- tailwind.config.js
- postcss.config.js
- test_mvp_requirements.py
- reset_service_and_rate_limiter
- test_project_tracker.mjs
- root
- reset_model_service_state
- generic_exception_handler
- main.py

## God Nodes (most connected - your core abstractions)
1. `Record` - 42 edges
2. `RecordValidator` - 32 edges
3. `CanonicalLabel` - 32 edges
4. `DatasetSchema` - 31 edges
5. `ModelService` - 29 edges
6. `LabelMapping` - 24 edges
7. `SafeDatasetReader` - 21 edges
8. `TFIDFExplainer` - 18 edges
9. `Icon()` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `ModelService` --uses--> `TFIDFExplainer`  [INFERRED]
  backend/app/services/model_service.py → ml/explainability.py
- `main()` --calls--> `TFIDFExplainer`  [EXTRACTED]
  scripts/test_english_model_readiness.py → ml/explainability.py
- `main()` --uses--> `PredictionResponse`  [INFERRED]
  scripts/test_english_model_readiness.py → backend/app/schemas/prediction.py
- `test_model_service_discovers_calibrated_artifacts()` --calls--> `ModelService`  [EXTRACTED]
  ml/tests/test_calibration_and_explainability.py → backend/app/services/model_service.py
- `test_hardened_hindi_model_artifact_contract()` --calls--> `ModelService`  [EXTRACTED]
  ml/tests/test_model_hardening.py → backend/app/services/model_service.py

## Import Cycles
- None detected.

## Communities (61 total, 16 thin omitted)

### Community 0 - "Record"
Cohesion: 0.09
Nodes (17): Record, test_english_synthetic_record(), test_mixed_script_synthetic_record(), test_romanized_hindi_synthetic_record(), standard_mapping(), test_configurable_text_length_bounds(), test_empty_and_whitespace_text_always_rejected(), test_is_missing_value_helper() (+9 more)

### Community 1 - "routes.py"
Cohesion: 0.08
Nodes (12): get_health(), get_samples(), HealthResponse, ModelReadiness, ErrorResponse, PredictionRequest, SampleExcerpt, EvidenceSourceItem (+4 more)

### Community 2 - "CanonicalLabel"
Cohesion: 0.12
Nodes (9): LabelMapping, LabelMappingError, test_inverted_label_mapping_supported_when_documented(), test_missing_documentation_reference_rejected(), test_missing_source_description_rejected(), test_non_binary_mapping_rejected(), test_string_case_insensitivity(), test_unmapped_label_raises_error() (+1 more)

### Community 3 - "package.json"
Cohesion: 0.05
Nodes (42): dependencies, next@16.4.5, react@19.3.1, react-dom@19.3.1, devDependencies, autoprefixer@10.4.20, eslint@9.39.5, eslint-config-next@16.4.5 (+34 more)

### Community 4 - "App.tsx"
Cohesion: 0.11
Nodes (34): App(), HomePage(), resolveApiBase(), AnalysisResult(), AnalysisResultProps, AnalyzePayload, Analyzer(), AnalyzerProps (+26 more)

### Community 5 - "project-tracker-data.server.ts"
Cohesion: 0.13
Nodes (36): dynamic, ProjectTrackerPage(), formatDate(), priorities, recordText(), StatusBadge(), statuses, statusStyles (+28 more)

### Community 6 - "test_p14_hardening.py"
Cohesion: 0.05
Nodes (19): prune_stale_rate_limit_ips(), test_disabled_inference_blocks_prediction_even_with_loaded_model(), test_enabled_inference_works_after_successful_loading(), test_english_and_hindi_flags_remain_independent(), test_failed_loading_does_not_enable_inference(), test_full_length_article_rejection(), test_hindi_safely_gated_pending_licensing(), test_input_domain_boundary_exact_maximum_500_chars() (+11 more)

### Community 7 - "test_database.py"
Cohesion: 0.06
Nodes (17): Base, Analysis, User, UserFeedback, get_db(), get_engine(), get_optional_db(), get_session_factory() (+9 more)

### Community 8 - "DatasetSchema"
Cohesion: 0.11
Nodes (9): SafeDatasetReader, DatasetSchema, test_exact_duplicate_detection(), test_empty_csv_file(), test_missing_required_columns_in_header(), test_nonexistent_file_raises_error(), test_read_csv_no_silent_row_discards(), test_read_text_file() (+1 more)

### Community 9 - "test_pipeline.py"
Cohesion: 0.10
Nodes (5): ClassicalCredibilityClassifier, EvaluationReport, test_artifact_saving_security_gate(), test_classical_classifier_english_pipeline(), test_classical_classifier_hindi_pipeline()

### Community 10 - "audit_indic_zenodo_hindi.py"
Cohesion: 0.10
Nodes (8): audit_folder(), is_article_file(), main(), sha256_file(), main(), quantile(), relative(), sha256_file()

### Community 11 - "test_calibration_and_explainability.py"
Cohesion: 0.14
Nodes (5): LocalExplanation, TFIDFExplainer, test_tfidf_explainer_english_word_level(), test_tfidf_explainer_hindi_character_level(), run_explainability_demonstrations()

### Community 12 - "test_quality.py"
Cohesion: 0.13
Nodes (4): DatasetAuditor, QualityReport, test_audit_report_json_serialization_and_privacy(), test_quality_audit_on_valid_dataset()

### Community 13 - "re"
Cohesion: 0.14
Nodes (8): clean_query_text(), search_google_news_rss(), search_web_evidence(), search_wikipedia_api(), search_ddg(), clean_isot_text(), clean_isot_text(), clean_isot_text()

### Community 14 - "test_frontend_integration.py"
Cohesion: 0.09
Nodes (10): test_cors_preflight_for_frontend_origins(), test_explanation_filters_uninformative_stop_words(), test_hindi_candidate_model_smoke_test_when_enabled(), test_http_503_error_payload_structure(), test_independent_gating_english_enabled_hindi_disabled(), test_legitimate_english_not_rejected_as_romanized_hindi(), test_prediction_response_schema_compatibility_with_frontend(), test_romanized_hindi_rejected_in_auto_mode() (+2 more)

### Community 15 - "run_p11_calibration_and_explainability.py"
Cohesion: 0.08
Nodes (18): audit_ifnd(), audit_isot(), audit_tallip(), audit_welfake(), main(), resolve_ifnd_path(), train_and_evaluate(), audit_file() (+10 more)

### Community 16 - "json"
Cohesion: 0.22
Nodes (6): main(), run_server(), wait_for_server(), main(), run_server(), wait_for_server()

### Community 17 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 18 - "update_project_tracker.mjs"
Cohesion: 0.12
Nodes (12): [action, ...argv], argsMap(), historyDirectory, lockPath, note, one(), options, root (+4 more)

### Community 19 - "test_predict.py"
Cohesion: 0.13
Nodes (7): test_cors_preflight(), test_predict_rejects_conflicting_language_hint(), test_predict_rejects_too_long_text(), test_predict_rejects_too_short_text(), test_predict_rejects_unsupported_script(), test_predict_returns_503_for_valid_english_without_models(), test_predict_returns_503_for_valid_hindi_without_models()

### Community 20 - "validate_project_tracker.mjs"
Cohesion: 0.22
Nodes (8): allowedStatuses, executionIds, executions, priorities, requireValue(), root, tracker, unique()

### Community 21 - "RecordValidator"
Cohesion: 0.15
Nodes (6): ValidationError, test_unsupported_non_devanagari_non_latin_script(), test_no_automatic_inference_of_romanized_hindi_without_metadata(), test_romanized_hindi_rejected_only_when_strict_script_matching_enabled(), is_missing_value(), RecordValidator

### Community 22 - "readers.py"
Cohesion: 0.21
Nodes (4): DatasetReadError, resolve_ifnd_path(), test_resolve_ifnd_path_finds_actual_dataset(), test_resolve_ifnd_path_raises_on_invalid_dir()

### Community 23 - "ml/__init__.py"
Cohesion: 0.14
Nodes (5): test_devanagari_character_detection(), test_devanagari_hindi_synthetic_record(), test_latin_character_detection(), is_devanagari_char(), is_latin_char()

### Community 24 - "activate_maintenance_mode.mjs"
Cohesion: 0.13
Nodes (13): approvalAt, approvalEvidence, approvedBy, archivesDirectory, historyDirectory, lockPath, options, optionsFrom() (+5 more)

### Community 25 - "ModelService"
Cohesion: 0.15
Nodes (7): PredictionResponse, TokenAttribution, ModelService, ModelUnavailableException, test_production_api_still_disabled(), test_production_readiness_remains_safely_disabled(), main()

### Community 26 - "verify_b06_investigation.mjs"
Cohesion: 0.12
Nodes (11): b06Report, canonicalDocs, hash, stats, stream, b07Content, b08Content, canonicalDocs (+3 more)

### Community 27 - "verify_e2e_full_browser.mjs"
Cohesion: 0.28
Nodes (13): killProcessesOnPorts(), main(), clickAnalyze(), clickClear(), evaluate(), sendCommand(), setInputAndLanguage(), takeScreenshot() (+5 more)

### Community 28 - "test_verify.py"
Cohesion: 0.12
Nodes (7): test_verify_english_headline(), test_verify_full_article_text(), test_verify_hindi_devanagari_headline(), test_verify_rejects_empty_or_too_short_headline(), test_verify_romanized_hindi(), test_verify_ssrf_blocks_private_destinations(), test_verify_unreported_claim_insufficient_evidence()

### Community 29 - "detect_script_and_language"
Cohesion: 0.19
Nodes (5): detect_script_and_language(), is_devanagari_char(), is_latin_char(), is_likely_romanized_hindi(), UnsupportedLanguageException

### Community 30 - "get_url"
Cohesion: 0.33
Nodes (3): get_url(), run_migrations_offline(), run_migrations_online()

### Community 31 - "Settings"
Cohesion: 0.18
Nodes (3): Settings, test_custom_models_directory_configuration(), test_environment_variable_reconciliation()

### Community 32 - "session.py"
Cohesion: 0.10
Nodes (5): upgrade(), test_default_production_gating_returns_503(), test_english_candidate_integration_end_to_end(), test_hindi_inference_remains_safely_gated_503(), test_input_validation_boundary_conditions()

### Community 33 - "numpy"
Cohesion: 0.09
Nodes (6): CalibrationMetrics, compute_expected_calibration_error(), evaluate_calibration(), ModelCalibrator, test_expected_calibration_error_calculation(), test_model_calibrator_split_hygiene()

### Community 37 - "test_pipeline.py"
Cohesion: 0.15
Nodes (6): DataSplit, prepare_and_split_records(), CanonicalLabel, synthetic_records_en(), synthetic_records_hi(), test_prepare_and_split_stratification_and_leakage()

### Community 39 - "verify_e2e_english_website.mjs"
Cohesion: 0.31
Nodes (5): killProcessesOnPorts(), main(), sleep(), TEMP_PROFILE, waitForUrl()

### Community 40 - "verify_e2e_browser_inference.mjs"
Cohesion: 0.36
Nodes (3): main(), sleep(), waitForUrl()

### Community 41 - "verify_mvp_runtime.mjs"
Cohesion: 0.24
Nodes (12): killProcessesOnPorts(), runMvpSmokeTest(), captureScreenshot(), clickElement(), evaluate(), sendCommand(), setInputValue(), setLanguage() (+4 more)

### Community 42 - "test_frontend_api_integration.mjs"
Cohesion: 0.53
Nodes (4): main(), resolveApiBase(), runMockBackendIntegrationTests(), runUrlResolutionTests()

### Community 43 - "url_extractor.py"
Cohesion: 0.26
Nodes (4): extract_headline_and_body(), fetch_news_url(), validate_url_safety(), is_safe_url()

### Community 44 - "verify_news"
Cohesion: 0.20
Nodes (3): predict_article(), verify_news(), URLExtractionException

### Community 51 - "test_mvp_requirements.py"
Cohesion: 0.28
Nodes (3): analyze_news_with_evidence(), _analyze_with_gemini(), run_mvp_suite()

### Community 55 - "test_project_tracker.mjs"
Cohesion: 0.33
Nodes (3): fixture, root, scripts

### Community 64 - "generic_exception_handler"
Cohesion: 0.16
Nodes (4): generic_exception_handler(), http_exception_handler(), security_and_rate_limit_middleware(), validation_exception_handler()

### Community 65 - "main.py"
Cohesion: 0.12
Nodes (4): test_health_endpoint(), test_root_endpoint(), test_root_health_returns_404_by_contract(), test_samples_endpoint()

## Knowledge Gaps
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Record` connect `Record` to `test_pipeline.py`, `DatasetSchema`, `test_quality.py`, `run_p11_calibration_and_explainability.py`, `RecordValidator`, `readers.py`, `ml/__init__.py`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Record` (e.g. with `prepare_and_split_records()` and `DatasetAuditor`) actually correct?**
  _`Record` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `Record` be split into smaller, more focused modules?**
  _Cohesion score 0.08658536585365853 - nodes in this community are weakly interconnected._
- **Why does `ModelService` connect `ModelService` to `routes.py`, `.get_candidate_baseline_artifacts`, `.models_dir`, `.load_calibrated_pipeline`, `numpy`, `test_calibration_and_explainability.py`, `readers.py`, `detect_script_and_language`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `RecordValidator` (e.g. with `validator()` and `LabelMapping`) actually correct?**
  _`RecordValidator` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `routes.py` be split into smaller, more focused modules?**
  _Cohesion score 0.07673469387755102 - nodes in this community are weakly interconnected._
- **Why does `CanonicalLabel` connect `test_pipeline.py` to `Record`, `CanonicalLabel`, `test_quality.py`, `run_p11_calibration_and_explainability.py`, `RecordValidator`, `ml/__init__.py`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._