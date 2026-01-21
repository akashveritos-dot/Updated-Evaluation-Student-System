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

  <div class="container-fluid">
    <div class="row">
      <!-- Left Section (Slider) -->
      <div class="col-md-6 p-0">
        <div id="sliderCarousel" class="carousel slide" data-bs-ride="false">
          <div class="carousel-inner">
            <?php
            $images = array_values(array_diff(scandir('images'), ['.', '..']));
            foreach ($images as $key => $image) {
            ?>
              <div class="carousel-item <?= $key == 0 ?  'active' : '' ?>">
                <img src="images/<?= $image ?>" class="d-block w-100" alt="Slide <?= $key ?>">
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
      </div>

      <!-- Right Section (Heading + Table + Pagination) -->
      <div class="col-md-6 d-flex flex-column p-0 right-section">
        <div class="bg-primary text-white p-2 d-flex justify-content-between align-items-center flex-wrap">
          <h5 class="mb-0 text-center flex-grow-1">VeriEval Marking Panel</h5>

          <!-- Button Group -->
          <div class="btn-group btn-group-sm" role="group" aria-label="View & Support Buttons">
            <button type="button" class="btn btn-info d-none d-sm-inline"
              data-bs-toggle="tooltip" title="Mobile View Supported">
              <i class="bi bi-phone"></i>
            </button>

            <button type="button" class="btn btn-warning d-none d-lg-inline"
              data-bs-toggle="tooltip" title="Desktop View Supported">
              <i class="bi bi-pc-display-horizontal"></i>
            </button>
            <button type="button" class="btn btn-info btn-sm"
              data-bs-toggle="offcanvas" data-bs-target="#helpModal"
              title="Help" data-bs-toggle="tooltip">
              <i class="bi bi-question-circle"></i> </button>

            <button type="button" class="btn btn-success"
              data-bs-toggle="tooltip" title="Support">
              <i class="bi bi-life-preserver"></i>
            </button>
          </div>
        </div>

        <!-- Content Area: Fixed left (100px) + Flexible right -->
        <div class="d-flex flex-grow-1">
          <div class="fixed-col d-flex align-items-center justify-content-center border-end">
            <strong>Side</strong>
          </div>

          <div class="question-section">
            <?php
            // Load JSON from file
            $json = file_get_contents('questions.jsonc');
            $questions = json_decode($json);
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
                  <?php foreach ($questions as $q): ?>
                    <?php
                    // Simulate or assign obtained marks and status
                    $maxMarks = $q->marks;
                    $obtained = rand(0, $maxMarks); // simulate
                    $status = ['A', 'OA', 'NA', 'NM'][rand(0, 3)];
                    $statusMap = [
                      'A' => ['Attempted', 'bg-primary'],
                      'OA' => ['Over Attempted', 'bg-warning text-dark'],
                      'NA' => ['Not Attempted', 'bg-secondary'],
                      'NM' => ['Not Marked / Untouched', 'bg-danger text-light border']

                    ];
                    ?>
                    <tr>
                      <td><?= htmlspecialchars($q->question_no) ?></td>
                      <td><?= htmlspecialchars($q->question) ?></td>
                      <td><?= $obtained ?> / <?= $maxMarks ?></td>
                      <td class="text-center">
                        <span class="badge <?= $statusMap[$status][1] ?> badge-status cursor-pointer"
                          data-bs-toggle="tooltip"
                          title="<?= $statusMap[$status][0] ?>">
                          <?= $status ?>
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-xs btn-success w-100">Select</button>
                      </td>
                    </tr>
                  <?php endforeach; ?>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="5" class="text-end fw-bold">
                      <span class="cursor-pointer" data-bs-toggle="tooltip" title="Total number of questions assigned">TQ: 50</span> |
                      <span class="cursor-pointer badge <?= implode(' ', $statusMap['NM']) ?>" data-bs-toggle="tooltip" title="Questions untouched or not marked">NM: 5</span> |
                      <span class="cursor-pointer badge <?= implode(' ', $statusMap['A']) ?>" data-bs-toggle="tooltip" title="Questions the candidate attempted">A: 10</span> |
                      <span class="cursor-pointer badge <?= implode(' ', $statusMap['OA']) ?>" data-bs-toggle="tooltip" title="Questions attempted more than once (if allowed)">OA: 5</span> |
                      <span class="cursor-pointer badge <?= implode(' ', $statusMap['NA']) ?>" data-bs-toggle="tooltip" title="Questions left unattempted">NA: 35</span> |
                      <span class="cursor-pointer" data-bs-toggle="tooltip" title="Questions marked for review (yet to be submitted)">Marked: 2</span> |
                      <span class="cursor-pointer" data-bs-toggle="tooltip" title="Questions correctly answered (auto-evaluated)">Correct: 8</span> |
                      <span class="cursor-pointer" data-bs-toggle="tooltip" title="Questions incorrectly answered">Wrong: 2</span> |
                      <span class="cursor-pointer" data-bs-toggle="tooltip" title="Total marks obtained (70) out of 40 allocated — may include bonus or extra attempts.">Total Marks: 70/40</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p class="pb-3 bg-secondary mb-0"></p>
            <?php
            // Simulate 30 pages of marking data
            $totalPages = 30;
            $rows = [];

            for ($page = 1; $page <= $totalPages; $page++) {
              $questionsOnPage = rand(3, 6); // 3 to 6 questions per page
              $actions = [];
              $totalMarks = 0;

              for ($q = 1; $q <= $questionsOnPage; $q++) {
                $marks = rand(5, 20);
                $statusPassed = rand(0, 1); // 0 or 1
                $bonus = rand(0, 2) === 2;

                $statusIcon = $statusPassed
                  ? '<i class="bi bi-check-circle-fill text-success" data-bs-toggle="tooltip" title="Attempted"></i>'
                  : '<i class="bi bi-x-circle-fill text-danger" data-bs-toggle="tooltip" title="Not Attempted"></i>';

                $bonusIcon = $bonus
                  ? '<i class="bi bi-cash-coin text-warning ms-1" data-bs-toggle="tooltip" title="Bonus Question / Extra Credit"></i>'
                  : '';

                $actions[] = "Q$q: {$marks}M $statusIcon $bonusIcon";

                if ($statusPassed) $totalMarks += $marks;
              }

              $rows[] = [
                'page' => $page,
                'qpp' => $questionsOnPage,
                'actions' => implode(' <span class="text-muted px-1">|</span> ', $actions),
                'marks' => $totalMarks
              ];
            }
            $totalQuestions = 0;
            $totalMarksAll = 0;


            ?>

            <!-- Bootstrap Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Page</th>
                    <th data-bs-toggle="tooltip" title="Questions Per Page">Q/PG</th>
                    <th>Actions and Marks on Page</th>
                    <th>Marks</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach ($rows as $row):
                    $totalQuestions += $row['qpp'];
                    $totalMarksAll += $row['marks'];

                  ?>
                    <tr>
                      <td><?= $row['page'] ?></td>
                      <td><?= $row['qpp'] ?></td>
                      <td><?= $row['actions'] ?></td>
                      <td><?= $row['marks'] ?></td>
                    </tr>
                  <?php endforeach; ?>
                </tbody>
                <tfoot class="table-light fw-bold">
                  <tr>
                    <td colspan="4" class="text-end">
                      <span data-bs-toggle="tooltip" title="Total number of questions across all pages">
                        Total Questions: <?= $totalQuestions ?>
                      </span>
                      <span class="text-muted px-2">|</span>

                      <span data-bs-toggle="tooltip" title="Total marks obtained across all pages">
                        Total Marks: <?= $totalMarksAll ?>
                      </span>
                      <span class="text-muted px-2">|</span>

                      <span data-bs-toggle="tooltip" title="Number of evaluated pages">
                        Pages: <?= count($rows) ?>
                      </span>
                      <span class="text-muted px-2">|</span>

                      <span data-bs-toggle="tooltip" title="Average questions per page">
                        Avg Q/PG: <?= round($totalQuestions / count($rows), 2) ?>
                      </span>
                    </td>
                  </tr>
                </tfoot>

              </table>
            </div>
            <p class="pb-3 bg-secondary mb-0"></p>

            <div class="table-responsive pt-4 bg-light">
              <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">

                <!-- Section 1: Pagination + Go to Page -->
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <!-- Pagination -->
                  <nav aria-label="Page navigation">
                    <ul class="pagination mb-0">
                      <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
                      <li class="page-item active"><a class="page-link" href="#">1</a></li>
                      <li class="page-item"><a class="page-link" href="#">2</a></li>
                      <li class="page-item"><a class="page-link" href="#">3</a></li>
                      <li class="page-item"><a class="page-link" href="#">Next</a></li>
                    </ul>
                  </nav>

                  <!-- Go to Page Input + Go Button -->
                  <div class="d-flex align-items-center gap-2">
                    <input type="number" min="1" max="30" id="gotoPageInput" class="form-control form-control-sm"
                      placeholder="Go to" style="width: 80px;">
                    <button type="button" class="btn btn-sm btn-primary" id="gotoPageBtn"
                      data-bs-toggle="tooltip" title="Jump to a specific page">
                      Go
                    </button>
                  </div>
                </div>

                <!-- Section 2: Submit All + Undo -->
                <div class="d-flex align-items-center gap-2">
                  <button type="button" class="btn btn-success btn-sm" id="submitAllBtn"
                    data-bs-toggle="tooltip" title="Submit all markings">
                    <i class="bi bi-check-circle me-1"></i> Submit All
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" id="undoActionBtn"
                    data-bs-toggle="tooltip" title="Undo last action">
                    <i class="bi bi-arrow-counterclockwise"></i> Undo
                  </button>
                </div>
              </div>
            </div>



          </div>
        </div>
      </div>
    </div>
  </div>


  <div class="offcanvas offcanvas-end" tabindex="-1" id="helpModal" aria-labelledby="helpOverlayLabel">
    <div class="offcanvas-header bg-info text-white">
      <h5 class="offcanvas-title" id="helpOverlayLabel">
        <i class="bi bi-info-circle-fill"></i> Help & Guide
      </h5>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <h6><i class="bi bi-caret-right-fill text-primary"></i> Navigation</h6>
      <p>Use the pagination to navigate or jump using the Go To box.</p>

      <h6><i class="bi bi-caret-right-fill text-primary"></i> Submitting</h6>
      <p>Click the <strong>Submit All</strong> button when ready to submit your responses.</p>

      <h6><i class="bi bi-caret-right-fill text-primary"></i> Marking Status</h6>
      <ul>
        <li><span class="badge bg-primary">A</span> Attempted</li>
        <li><span class="badge bg-warning text-dark">OA</span> Over Attempted</li>
        <li><span class="badge bg-secondary">NA</span> Not Attempted</li>
        <li><span class="badge bg-light border">NM</span> Not Marked</li>
      </ul>

      <h6><i class="bi bi-caret-right-fill text-primary"></i> Icons Reference</h6>
      <p>
        <i class="bi bi-arrow-counterclockwise text-secondary"></i> Undo <br>
        <i class="bi bi-check-circle text-success"></i> Submit All <br>
        <i class="bi bi-x-circle text-danger"></i> Reset Field
      </p>

      <div class="alert alert-warning mt-4">
        <i class="bi bi-exclamation-triangle"></i> Please review all answers before final submission.
      </div>
    </div>
  </div>

  <!-- Bootstrap 5 JS Bundle -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="script.js"></script>
</body>

</html>