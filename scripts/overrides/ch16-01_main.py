if __name__ == "__main__":
    # Exercise the tool directly: an in-registry source and the
    # authority-drift rejection path.
    print(fetch_regulatory_publications("eiopa", cycle_window_days=7))
    print(fetch_regulatory_publications("some_blog", cycle_window_days=7))
