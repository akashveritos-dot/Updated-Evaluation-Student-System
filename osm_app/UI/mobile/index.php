<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Split Layout with Slider and Questions</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">

    <link rel="stylesheet" href="style.css">
</head>

<body class="bg-danger">
    <nav class="navbar navbar-expand-lg navbar-primary bg-primary ">
        <div class="container-fluid">
            <a class="navbar-brand text-light fw-bolder" href="#">VeriEval Marking Panel</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"
                style="filter: invert(1);">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">

            </div>
        </div>
    </nav>
    <div class="container-fluid">
        <div class="row">
            <!-- Left Section (Slider) -->
            <div class="col-md-12 p-0">

                <style>
                    .scroll-container {
                        overflow-x: auto;
                        white-space: nowrap;
                    }

                    .scroll-container::-webkit-scrollbar {
                        height: 6px;
                    }

                    .scroll-container::-webkit-scrollbar-thumb {
                        background-color: #ccc;
                        border-radius: 4px;
                    }
                </style>

                <div class="scroll-container bg-light px-2 py-2">
                    <div class="d-flex align-items-center flex-nowrap gap-2" style="min-width: max-content;">

                        <!-- Page Navigation -->
                        <div class="d-flex align-items-center gap-2" role="group" aria-label="Page Navigation">
                            <button class="btn btn-sm lh-1 py-2 d-flex align-items-center btn-outline-secondary" id="prevBtn" data-bs-toggle="tooltip" title="Last Page">
                                <i class="bi bi-chevron-double-left me-2"></i> Last
                            </button>
                            <select id="pageSelect" class="form-select form-select-sm w-auto border-dark" data-bs-toggle="tooltip" title="Select Page">
                                <?php for ($i = 1; $i <= 30; $i++): ?>
                                    <option value="<?= $i ?>">Page <?= $i ?></option>
                                <?php endfor; ?>
                            </select>
                            <button class="btn btn-sm lh-1 py-2 d-flex align-items-center btn-outline-secondary" id="nextBtn" data-bs-toggle="tooltip" title="Next Page">
                                Next <i class="bi bi-chevron-double-right ms-2"></i>
                            </button>
                        </div>

                        <!-- Zoom Controls -->
                        <div class="btn-group" role="group" aria-label="Zoom Controls">
                            <button class="btn btn-sm btn-outline-dark" id="zoomOutBtn" data-bs-toggle="tooltip" title="Zoom Out">
                                <i class="bi bi-zoom-out"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-dark" id="zoomInBtn" data-bs-toggle="tooltip" title="Zoom In">
                                <i class="bi bi-zoom-in"></i>
                            </button>
                        </div>

                        <!-- Time Taken -->
                        <div class="text-muted small fw-semibold btn btn-sm btn-outline-dark" data-bs-toggle="tooltip" title="Time spent on evaluation">
                            <i class="bi bi-clock-history me-1"></i><span id="timeTaken">00:00:00</span>
                        </div>

                        <!-- Orientation Controls -->
                        <div class="btn-group" role="group" aria-label="Orientation Controls">
                            <button class="btn btn-sm btn-outline-secondary active" id="portraitBtn" data-bs-toggle="tooltip" title="Portrait Mode">
                                <i class="bi bi-phone"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" id="landscapeBtn" data-bs-toggle="tooltip" title="Landscape Mode">
                                <i class="bi bi-phone-landscape"></i>
                            </button>
                        </div>

                    </div>
                </div>



                <div id="sliderCarousel" class="carousel slide" data-bs-ride="false">
                    <div class="carousel-inner">
                        <?php
                        $images = array_values(array_diff(scandir('../images'), ['.', '..']));
                        foreach ($images as $key => $image) {
                        ?>
                            <div class="carousel-item <?= $key == 0 ?  'active' : '' ?>">
                                <img src="../images/<?= $image ?>" class="d-block w-100" alt="Slide <?= $key ?>">
                            </div>
                        <?php
                        }
                        ?>
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#sliderCarousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon"></span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#sliderCarousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon"></span>
                    </button>
                </div>
                <div class="d-flex justify-content-start align-items-center gap-2 flex-wrap px-2 py-2 bg-light">
                    <?php
                    $tools = [
                        ['icon' => 'bi-eye', 'label' => 'Seen', 'tooltip' => 'Mark as seen'],
                        ['icon' => 'bi-x', 'label' => 'Mark Blank', 'tooltip' => 'Mark this area as blank'],
                        ['icon' => 'bi-arrow-counterclockwise', 'label' => 'Undo', 'tooltip' => 'Undo last action'],
                    ];
                    foreach ($tools as $i => $tool): ?>
                        <button class="btn btn-sm btn-outline-dark text-nowrap"
                            <?= isset($tool['disabled']) && $tool['disabled'] ? 'disabled' : '' ?>
                            data-bs-toggle="tooltip" title="<?= $tool['tooltip'] ?>">
                            <i class="bi <?= $tool['icon'] ?>"></i> <?= $tool['label'] ?>
                        </button>
                    <?php endforeach; ?>
                    <button class="btn btn-sm btn-outline-primary text-nowrap"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#questionOffcanvas"
                        aria-controls="questionOffcanvas"
                        title="Choose a specific question to jump to">
                        <i class="bi bi-list-ul"></i> Questions
                    </button>

                </div>

            </div>
        </div>
    </div>
    </div>

    <!-- Bootstrap 5 JS Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js"></script>


    <!-- Offcanvas for Question Selection -->
    <div class="offcanvas offcanvas-end w-100" tabindex="-1" id="questionOffcanvas" aria-labelledby="questionOffcanvasLabel">
        <div class="offcanvas-header bg-primary text-white">
            <h5 class="offcanvas-title" id="questionOffcanvasLabel">Select a Question</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>

        <div class="offcanvas-body p-0">
            <?php
            $json = file_get_contents('../questions.jsonc');
            $questions = json_decode($json);
            $statusMap = [
                'A' => ['Attempted', 'bg-primary'],
                'OA' => ['Over Attempted', 'bg-warning text-dark'],
                'NA' => ['Not Attempted', 'bg-secondary'],
                'NM' => ['Not Marked / Untouched', 'bg-danger text-light border']
            ];
            ?>

            <div class="table-responsive">
                <table class="table table-bordered table-sm mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>#</th>
                            <th>Question</th>
                            <th>Marks</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($questions as $index => $q): ?>
                            <?php
                            $maxMarks = $q->marks;
                            $obtained = rand(0, $maxMarks);
                            $status = ['A', 'OA', 'NA', 'NM'][rand(0, 3)];
                            ?>
                            <tr>
                                <td><?= htmlspecialchars($q->question_no) ?></td>
                                <td><?= htmlspecialchars($q->question) ?></td>
                                <td><?= $obtained ?> / <?= $maxMarks ?></td>
                                <td class="text-center">
                                    <span class="badge <?= $statusMap[$status][1] ?>" data-bs-toggle="tooltip" title="<?= $statusMap[$status][0] ?>">
                                        <?= $status ?>
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-xs btn-outline-success w-100 select-question">Select</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5" class="text-end fw-bold small px-2 py-1">
                                <span data-bs-toggle="tooltip" title="Total questions">TQ: 50</span> |
                                <span class="badge <?= implode(' ', $statusMap['NM']) ?>" data-bs-toggle="tooltip" title="Not Marked">NM: 5</span> |
                                <span class="badge <?= implode(' ', $statusMap['A']) ?>" data-bs-toggle="tooltip" title="Attempted">A: 10</span> |
                                <span class="badge <?= implode(' ', $statusMap['OA']) ?>" data-bs-toggle="tooltip" title="Over Attempted">OA: 5</span> |
                                <span class="badge <?= implode(' ', $statusMap['NA']) ?>" data-bs-toggle="tooltip" title="Not Attempted">NA: 35</span> |
                                <span data-bs-toggle="tooltip" title="Marked for review">Marked: 2</span> |
                                <span data-bs-toggle="tooltip" title="Correct Answers">Correct: 8</span> |
                                <span data-bs-toggle="tooltip" title="Wrong Answers">Wrong: 2</span> |
                                <span data-bs-toggle="tooltip" title="Total Marks Obtained">Total Marks: 70 / 40</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>

</body>

</html>