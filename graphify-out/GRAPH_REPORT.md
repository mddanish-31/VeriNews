# Graph Report - VeriNews  (2026-11-12)

## Corpus Check
- 140 files · ~273,734 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: (none) 4, .csv 4, .otf 3)

## Summary
- 1374 nodes · 2843 edges · 86 communities (68 shown, 18 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 213 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ef2b0b8d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Record
- verify_phase2_browser_qa.mjs
- CanonicalLabel
- package.json
- App.tsx
- project-tracker-data.server.ts
- test_p14_hardening.py
- test_database.py
- DatasetSchema
- fetch_news_url
- audit_indic_zenodo_hindi.py
- test_qa_regression.py
- ml/__init__.py
- validate_url_safety
- test_frontend_integration.py
- audit_and_train_baselines.py
- json
- compilerOptions
- update_project_tracker.mjs
- test_predict.py
- ref_node_fs
- verify_neural_vortex.mjs
- ClassicalCredibilityClassifier
- activate_maintenance_mode.mjs
- ModelService
- verify_b06_investigation.mjs
- verify_e2e_full_browser.mjs
- test_verify.py
- test_qa_regression.py
- fastapi_testclient
- Settings
- test_integration_p13.py
- URLExtractionException
- test_calibration_and_explainability.py
- routes.py
- test_pipeline.py
- session.py
- env.py
- VerificationRequest
- measure_web_vitals.mjs
- verify_mvp_runtime.mjs
- is_ip_address_safe
- test_qa_regression.py
- audit_consistency.mjs
- tailwind.config.js
- postcss.config.js
- test_model_hardening.py
- ref_node_fs
- get_engine
- validation.py
- layout.tsx
- run_p11_calibration_and_explainability.py
- SmoothScrollProvider.tsx
- model_service.py
- verify_phase3_browser_qa.mjs
- _LocalRedirectServerFixture
- dependencies
- verify_phase1_browser_qa.mjs
- generic_exception_handler
- update_trackers.mjs
- evaluate_calibration
- scripts
- verify_theme_switcher.mjs
- eslint
- ParticleWaveCanvas.tsx
- verify_redesign_homepage.mjs
- overrides
- .load_calibrated_pipeline
- url_extractor.py
- ref_node_child_process
- measure_web_vitals.mjs
- investigate_and_harden_models.py
- test_database.py
- TFIDFExplainer
- validate_project_tracker.mjs
- test_project_tracker.mjs
- verify_e2e_browser_inference.mjs

## God Nodes (most connected - your core abstractions)
1. `Record` - 42 edges
2. `RecordValidator` - 32 edges
3. `CanonicalLabel` - 32 edges
4. `DatasetSchema` - 31 edges
5. `ModelService` - 29 edges
6. `LabelMapping` - 24 edges
7. `Icon()` - 23 edges
8. `validate_url_safety()` - 23 edges
9. `URLExtractionException` - 22 edges
10. `fetch_news_url()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `ModelService` --uses--> `TFIDFExplainer`  [INFERRED]
  backend/app/services/model_service.py → ml/explainability.py
- `test_model_service_discovers_calibrated_artifacts()` --calls--> `ModelService`  [EXTRACTED]
  ml/tests/test_calibration_and_explainability.py → backend/app/services/model_service.py
- `test_hardened_hindi_model_artifact_contract()` --calls--> `ModelService`  [EXTRACTED]
  ml/tests/test_model_hardening.py → backend/app/services/model_service.py
- `test_model_service_candidate_artifacts_discovery()` --calls--> `ModelService`  [EXTRACTED]
  ml/tests/test_model_hardening.py → backend/app/services/model_service.py
- `test_production_api_still_disabled()` --uses--> `ModelUnavailableException`  [INFERRED]
  ml/tests/test_calibration_and_explainability.py → backend/app/services/model_service.py

## Import Cycles
- None detected.

## Communities (86 total, 18 thin omitted)

### Community 0 - "Record"
Cohesion: 0.07
Nodes (22): Record, ValidationError, test_devanagari_hindi_synthetic_record(), test_english_synthetic_record(), test_mixed_script_synthetic_record(), test_romanized_hindi_synthetic_record(), test_unsupported_non_devanagari_non_latin_script(), test_configurable_text_length_bounds() (+14 more)

### Community 1 - "verify_phase2_browser_qa.mjs"
Cohesion: 0.28
Nodes (7): CdpClient, killProcessesOnPorts(), main(), SCREENSHOT_DIR, sleep(), TEMP_PROFILE, waitForUrl()

### Community 2 - "CanonicalLabel"
Cohesion: 0.12
Nodes (10): LabelMapping, LabelMappingError, CanonicalLabel, test_inverted_label_mapping_supported_when_documented(), test_missing_documentation_reference_rejected(), test_missing_source_description_rejected(), test_non_binary_mapping_rejected(), test_string_case_insensitivity() (+2 more)

### Community 3 - "package.json"
Cohesion: 0.13
Nodes (21): devDependencies, autoprefixer@10.4.20, postcss@8.5.32, tailwindcss@3.4.17, @types/node@24.19.2, @types/react@19.3.0, @types/react-dom@19.3.0, @types/three@^0.187.0 (+13 more)

### Community 4 - "App.tsx"
Cohesion: 0.06
Nodes (71): App(), HomePage(), formatDate(), priorities, statusBadgeVariants, statuses, TaskDetails(), TrackerDashboard() (+63 more)

### Community 5 - "project-tracker-data.server.ts"
Cohesion: 0.18
Nodes (26): dynamic, ProjectTrackerPage(), assertActivity(), assertExecution(), assertPhase(), assertTask(), fail(), isIsoDate() (+18 more)

### Community 6 - "test_p14_hardening.py"
Cohesion: 0.05
Nodes (17): reset_service_and_rate_limiter(), test_disabled_inference_blocks_prediction_even_with_loaded_model(), test_enabled_inference_works_after_successful_loading(), test_english_and_hindi_flags_remain_independent(), test_failed_loading_does_not_enable_inference(), test_full_length_article_rejection(), test_hindi_safely_gated_pending_licensing(), test_input_domain_boundary_exact_maximum_500_chars() (+9 more)

### Community 7 - "test_database.py"
Cohesion: 0.13
Nodes (6): Base, Analysis, User, UserFeedback, test_crud_and_foreign_key_constraints(), test_schema_zero_content_retention_invariants()

### Community 8 - "DatasetSchema"
Cohesion: 0.09
Nodes (11): DatasetReadError, SafeDatasetReader, DatasetSchema, test_empty_csv_file(), test_missing_required_columns_in_header(), test_nonexistent_file_raises_error(), test_read_csv_no_silent_row_discards(), test_read_text_file() (+3 more)

### Community 9 - "fetch_news_url"
Cohesion: 0.12
Nodes (11): extract_headline_and_body(), fetch_news_url(), test_01_http_302_to_loopback_blocked(), test_02_http_302_to_metadata_ip_blocked(), test_03_redirect_to_private_ipv4_blocked(), test_04_redirect_to_private_ipv6_blocked(), test_05_redirect_to_valid_public_destination_succeeds(), test_06_multiple_redirects_within_limit_succeeds() (+3 more)

### Community 10 - "audit_indic_zenodo_hindi.py"
Cohesion: 0.10
Nodes (8): audit_folder(), is_article_file(), main(), sha256_file(), main(), quantile(), relative(), sha256_file()

### Community 11 - "test_qa_regression.py"
Cohesion: 0.10
Nodes (9): test_vn01_language_auto_detection(), test_vn02_contradicted_evidence_summary_consistency(), test_vn02_insufficient_evidence_summary_not_asserting_fact(), test_vn03_french_language_rejected(), test_vn03_spanish_language_rejected(), test_vn05_unbroken_long_string_handled_safely(), test_vn08_web_search_includes_fact_check_sources(), test_vn09_headline_500_character_boundary() (+1 more)

### Community 12 - "ml/__init__.py"
Cohesion: 0.12
Nodes (5): DatasetAuditor, QualityReport, test_audit_report_json_serialization_and_privacy(), test_exact_duplicate_detection(), test_quality_audit_on_valid_dataset()

### Community 13 - "validate_url_safety"
Cohesion: 0.21
Nodes (5): clean_query_text(), search_google_news_rss(), search_web_evidence(), search_wikipedia_api(), search_ddg()

### Community 14 - "test_frontend_integration.py"
Cohesion: 0.09
Nodes (10): test_cors_preflight_for_frontend_origins(), test_explanation_filters_uninformative_stop_words(), test_hindi_candidate_model_smoke_test_when_enabled(), test_http_503_error_payload_structure(), test_independent_gating_english_enabled_hindi_disabled(), test_legitimate_english_not_rejected_as_romanized_hindi(), test_prediction_response_schema_compatibility_with_frontend(), test_romanized_hindi_rejected_in_auto_mode() (+2 more)

### Community 15 - "audit_and_train_baselines.py"
Cohesion: 0.18
Nodes (8): audit_ifnd(), audit_isot(), audit_tallip(), audit_welfake(), clean_isot_text(), main(), resolve_ifnd_path(), train_and_evaluate()

### Community 16 - "json"
Cohesion: 0.18
Nodes (8): run_test_for_language(), audit_file(), main(), run_server(), wait_for_server(), main(), run_server(), wait_for_server()

### Community 17 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 18 - "update_project_tracker.mjs"
Cohesion: 0.12
Nodes (12): [action, ...argv], argsMap(), historyDirectory, lockPath, note, one(), options, root (+4 more)

### Community 19 - "test_predict.py"
Cohesion: 0.13
Nodes (7): test_cors_preflight(), test_predict_rejects_conflicting_language_hint(), test_predict_rejects_too_long_text(), test_predict_rejects_too_short_text(), test_predict_rejects_unsupported_script(), test_predict_returns_503_for_valid_english_without_models(), test_predict_returns_503_for_valid_hindi_without_models()

### Community 20 - "ref_node_fs"
Cohesion: 0.20
Nodes (6): content, chunksDir, inventory, manifestPath, screenshotDir, screenshots

### Community 21 - "verify_neural_vortex.mjs"
Cohesion: 0.28
Nodes (7): CdpClient, killProcessesOnPorts(), runQa(), SCREENSHOT_DIR, sleep(), TEMP_PROFILE, waitForUrl()

### Community 22 - "ClassicalCredibilityClassifier"
Cohesion: 0.10
Nodes (5): ClassicalCredibilityClassifier, EvaluationReport, test_artifact_saving_security_gate(), test_classical_classifier_english_pipeline(), test_classical_classifier_hindi_pipeline()

### Community 24 - "activate_maintenance_mode.mjs"
Cohesion: 0.13
Nodes (13): approvalAt, approvalEvidence, approvedBy, archivesDirectory, historyDirectory, lockPath, options, optionsFrom() (+5 more)

### Community 25 - "ModelService"
Cohesion: 0.16
Nodes (6): PredictionResponse, ModelService, ModelUnavailableException, test_production_api_still_disabled(), test_production_readiness_remains_safely_disabled(), main()

### Community 26 - "verify_b06_investigation.mjs"
Cohesion: 0.12
Nodes (11): b06Report, canonicalDocs, hash, stats, stream, b07Content, b08Content, canonicalDocs (+3 more)

### Community 27 - "verify_e2e_full_browser.mjs"
Cohesion: 0.28
Nodes (13): killProcessesOnPorts(), main(), clickAnalyze(), clickClear(), evaluate(), sendCommand(), setInputAndLanguage(), takeScreenshot() (+5 more)

### Community 28 - "test_verify.py"
Cohesion: 0.09
Nodes (11): validate_url_safety(), test_vn04_bbc_article_url_is_safe(), test_vn07_user_friendly_dns_error(), test_12_nat64_public_destination_works(), test_verify_english_headline(), test_verify_full_article_text(), test_verify_hindi_devanagari_headline(), test_verify_rejects_empty_or_too_short_headline() (+3 more)

### Community 29 - "test_qa_regression.py"
Cohesion: 0.13
Nodes (8): predict_article(), verify_news(), detect_script_and_language(), detect_unsupported_latin_language(), is_devanagari_char(), is_latin_char(), is_likely_romanized_hindi(), UnsupportedLanguageException

### Community 30 - "fastapi_testclient"
Cohesion: 0.14
Nodes (4): test_health_endpoint(), test_root_endpoint(), test_root_health_returns_404_by_contract(), test_samples_endpoint()

### Community 31 - "Settings"
Cohesion: 0.18
Nodes (3): Settings, test_custom_models_directory_configuration(), test_environment_variable_reconciliation()

### Community 32 - "test_integration_p13.py"
Cohesion: 0.15
Nodes (5): reset_model_service_state(), test_default_production_gating_returns_503(), test_english_candidate_integration_end_to_end(), test_hindi_inference_remains_safely_gated_503(), test_input_validation_boundary_conditions()

### Community 33 - "URLExtractionException"
Cohesion: 0.18
Nodes (6): SafeSSRFNetworkBackend, URLExtractionException, test_09_mixed_public_private_dns_answers_rejected(), test_10_dns_rebinding_rejected(), test_11_connected_peer_ip_pinning_verified(), test_14_https_hostname_and_certificate_validation_intact()

### Community 35 - "routes.py"
Cohesion: 0.10
Nodes (10): get_health(), get_samples(), HealthResponse, ModelReadiness, ErrorResponse, PredictionRequest, TokenAttribution, SampleExcerpt (+2 more)

### Community 36 - "test_pipeline.py"
Cohesion: 0.18
Nodes (5): DataSplit, prepare_and_split_records(), synthetic_records_en(), synthetic_records_hi(), test_prepare_and_split_stratification_and_leakage()

### Community 37 - "session.py"
Cohesion: 0.19
Nodes (4): get_db(), get_optional_db(), get_session_factory(), test_session_lifecycle()

### Community 38 - "env.py"
Cohesion: 0.21
Nodes (4): get_url(), run_migrations_offline(), run_migrations_online(), upgrade()

### Community 40 - "measure_web_vitals.mjs"
Cohesion: 0.36
Nodes (4): main(), resolveApiBase(), runMockBackendIntegrationTests(), runUrlResolutionTests()

### Community 41 - "verify_mvp_runtime.mjs"
Cohesion: 0.27
Nodes (12): killProcessesOnPorts(), runMvpSmokeTest(), captureScreenshot(), clickElement(), evaluate(), sendCommand(), setInputValue(), setLanguage() (+4 more)

### Community 42 - "is_ip_address_safe"
Cohesion: 0.13
Nodes (7): is_ip_address_safe(), test_15_local_server_legitimate_relative_redirect(), mock_getaddrinfo(), mock_is_ip_safe(), test_15_local_server_redirect_cycle_detected(), test_15_local_server_redirect_to_loopback_blocked_pre_connect(), test_15_local_server_redirect_to_metadata_blocked_pre_connect()

### Community 43 - "test_qa_regression.py"
Cohesion: 0.13
Nodes (6): analyze_news_with_evidence(), _analyze_with_gemini(), _deterministic_evidence_concordance(), _enforce_verdict_consistency(), _extract_core_entities(), run_mvp_suite()

### Community 44 - "audit_consistency.mjs"
Cohesion: 0.18
Nodes (10): activity, dashboard, p4P, p4R, p5P, p5R, phaseStatus, progress (+2 more)

### Community 51 - "test_model_hardening.py"
Cohesion: 0.20
Nodes (3): test_model_service_candidate_artifacts_discovery(), test_resolve_ifnd_path_finds_actual_dataset(), test_resolve_ifnd_path_raises_on_invalid_dir()

### Community 53 - "ref_node_fs"
Cohesion: 0.32
Nodes (7): CdpClient, killProcessesOnPorts(), main(), SCREENSHOT_DIR, sleep(), TEMP_PROFILE, waitForUrl()

### Community 55 - "get_engine"
Cohesion: 0.17
Nodes (5): get_engine(), db_engine(), db_session(), test_zero_content_retention_during_inference(), test_zero_content_retention_on_headline_inference()

### Community 56 - "validation.py"
Cohesion: 0.15
Nodes (4): test_devanagari_character_detection(), test_latin_character_detection(), is_devanagari_char(), is_latin_char()

### Community 57 - "layout.tsx"
Cohesion: 0.27
Nodes (7): inter, manrope, metadata, notoSansDevanagari, RootLayout(), SmoothScrollProvider(), CustomCursor()

### Community 58 - "run_p11_calibration_and_explainability.py"
Cohesion: 0.17
Nodes (7): resolve_ifnd_path(), clean_isot_text(), load_ifnd_data(), load_isot_data(), load_tallip_data(), main(), run_explainability_demonstrations()

### Community 59 - "SmoothScrollProvider.tsx"
Cohesion: 0.22
Nodes (7): gsap@^3.15.1, lenis@^1.3.27, SmoothScrollContext, SmoothScrollContextType, SmoothScrollProviderProps, gsap, lenis

### Community 61 - "verify_phase3_browser_qa.mjs"
Cohesion: 0.32
Nodes (7): CdpClient, killProcessesOnPorts(), main(), SCREENSHOT_DIR, sleep(), TEMP_PROFILE, waitForUrl()

### Community 63 - "dependencies"
Cohesion: 0.29
Nodes (7): dependencies, next@16.4.5, react@19.3.1, react-dom@19.3.1, zod@^4.6.7, react-dom, zod

### Community 64 - "verify_phase1_browser_qa.mjs"
Cohesion: 0.32
Nodes (7): CdpClient, killProcessesOnPorts(), main(), SCREENSHOT_DIR, sleep(), TEMP_PROFILE, waitForUrl()

### Community 65 - "generic_exception_handler"
Cohesion: 0.10
Nodes (7): generic_exception_handler(), http_exception_handler(), prune_stale_rate_limit_ips(), root(), security_and_rate_limit_middleware(), validation_exception_handler(), test_rate_limiter_stale_ip_pruning()

### Community 66 - "update_trackers.mjs"
Cohesion: 0.18
Nodes (10): activity, newActivityEntry, p4Update, p5Update, pP4, pP5, progress, roadmap (+2 more)

### Community 67 - "evaluate_calibration"
Cohesion: 0.15
Nodes (5): CalibrationMetrics, evaluate_calibration(), ModelCalibrator, test_model_calibrator_split_hygiene(), run_calibration_experiments()

### Community 69 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, start, typecheck

### Community 70 - "verify_theme_switcher.mjs"
Cohesion: 0.32
Nodes (7): CdpClient, killProcessesOnPorts(), runQa(), SCREENSHOT_DIR, sleep(), TEMP_PROFILE, waitForUrl()

### Community 71 - "eslint"
Cohesion: 0.40
Nodes (4): eslint@9.39.5, eslint-config-next@16.4.5, eslint, eslint-config-next

### Community 72 - "ParticleWaveCanvas.tsx"
Cohesion: 0.40
Nodes (3): three@^0.187.0, ParticleWaveCanvasProps, three

### Community 73 - "verify_redesign_homepage.mjs"
Cohesion: 0.32
Nodes (7): CdpClient, killProcessesOnPorts(), runQa(), SCREENSHOT_DIR, sleep(), TEMP_PROFILE, waitForUrl()

### Community 74 - "overrides"
Cohesion: 0.67
Nodes (3): overrides, @typescript-eslint/typescript-estree, minimatch

### Community 77 - "ref_node_child_process"
Cohesion: 0.36
Nodes (5): killProcessesOnPorts(), main(), sleep(), TEMP_PROFILE, waitForUrl()

### Community 78 - "measure_web_vitals.mjs"
Cohesion: 0.47
Nodes (5): CdpClient, getWsUrl(), main(), measureViewport(), sleep()

### Community 79 - "investigate_and_harden_models.py"
Cohesion: 0.16
Nodes (7): benchmark_latency(), clean_isot_text(), improve_hindi_baseline(), investigate_ifnd_leakage(), investigate_isot_leakage(), main(), resolve_ifnd_path()

### Community 82 - "TFIDFExplainer"
Cohesion: 0.27
Nodes (3): TFIDFExplainer, test_tfidf_explainer_english_word_level(), test_tfidf_explainer_hindi_character_level()

### Community 83 - "validate_project_tracker.mjs"
Cohesion: 0.22
Nodes (8): allowedStatuses, executionIds, executions, priorities, requireValue(), root, tracker, unique()

### Community 84 - "test_project_tracker.mjs"
Cohesion: 0.33
Nodes (3): fixture, root, scripts

### Community 85 - "verify_e2e_browser_inference.mjs"
Cohesion: 0.70
Nodes (3): main(), sleep(), waitForUrl()

## Knowledge Gaps
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.tsx` to `package.json`, `ParticleWaveCanvas.tsx`, `layout.tsx`, `SmoothScrollProvider.tsx`, `dependencies`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Record` (e.g. with `prepare_and_split_records()` and `DatasetAuditor`) actually correct?**
  _`Record` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Should `Record` be split into smaller, more focused modules?**
  _Cohesion score 0.07355769230769231 - nodes in this community are weakly interconnected._
- **Why does `TFIDFExplainer` connect `TFIDFExplainer` to `test_calibration_and_explainability.py`, `routes.py`, `.models_dir`, `ModelService`, `run_p11_calibration_and_explainability.py`, `model_service.py`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `RecordValidator` (e.g. with `validator()` and `LabelMapping`) actually correct?**
  _`RecordValidator` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `CanonicalLabel` be split into smaller, more focused modules?**
  _Cohesion score 0.11942959001782531 - nodes in this community are weakly interconnected._
- **Why does `DatasetSchema` connect `DatasetSchema` to `validation.py`, `Record`, `test_pipeline.py`, `ml/__init__.py`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._