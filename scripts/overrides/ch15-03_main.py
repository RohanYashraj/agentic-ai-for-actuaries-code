if __name__ == "__main__":
    # Build a valuation output by running the Ch 15 valuation tool directly.
    import importlib
    value_scheme = importlib.import_module("01_pension_valuation").value_scheme
    valuation_output = value_scheme("UKDB-MER-001", "2025-03-31")
    result = draft_annual_statement(
        member_id="UKA-00007", valuation_date="2025-03-31",
        valuation_output=valuation_output)
    print(f"status: {result['status']}   member: {result['member_id']}")
    print(f"statement: {result['statement_text']}")
    print("citations:")
    for claim, source in result["citations"].items():
        print(f"  {claim}: {source}")
