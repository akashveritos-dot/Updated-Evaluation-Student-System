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
        <div class="d-flex justify-content-between align-items-center flex-wrap px-2 py-2 bg-light">

          <!-- Navigation Buttons -->
          <div class="btn-group" role="group" aria-label="Page Navigation">
            <button class="btn btn-sm lh-1 py-2 d-flex align-items-center btn-outline-secondary" id="prevBtn" data-bs-toggle="tooltip" title="Previous Page">
              <i class="bi bi-chevron-double-left me-2"></i> Previous
            </button>
            <button class="btn btn-sm lh-1 py-2 d-flex align-items-center btn-outline-secondary" id="nextBtn" data-bs-toggle="tooltip" title="Next Page">
              Next <i class="bi bi-chevron-double-right ms-2"></i>
            </button>
          </div>

          <!-- Page Selection -->
          <div class="d-flex align-items-center gap-2">
            <label for="pageSelect" class="mb-0 small fw-semibold">Go to Page:</label>
            <select id="pageSelect" class="form-select form-select-sm w-auto" data-bs-toggle="tooltip" title="Select Page">
              <?php for ($i = 1; $i <= 30; $i++): ?>
                <option value="<?= $i ?>">Page <?= $i ?></option>
              <?php endfor; ?>
            </select>
          </div>

          <!-- Time & Zoom -->
          <div class="d-flex align-items-center gap-3">
            <div class="text-muted small fw-semibold" data-bs-toggle="tooltip" title="Time spent on evaluation" style="width: 140px;">
              <i class="bi bi-clock-history me-1"></i>Time Taken: <span id="timeTaken">00:00:00</span>
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
            <!-- Zoom Controls -->
            <div class="btn-group" role="group" aria-label="Zoom Controls">
              <button class="btn btn-sm btn-outline-secondary active" id="portraitBtn" data-bs-toggle="tooltip" title="Portrait Mode">
                <i class="bi bi-phone"></i>
              </button>

              <!-- Landscape Mode -->
              <button class="btn btn-sm btn-outline-secondary" id="landscapeBtn" data-bs-toggle="tooltip" title="Landscape Mode">
                <i class="bi bi-phone-landscape"></i>
              </button>

            </div>

          </div>

        </div>


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
          <div class="fixed-col d-flex flex-column align-items-center justify-content-start border-end p-2 gap-2 bg-light" style="width: 100px;">
            <strong class="mb-2">Tools</strong>

            <?php
            // Tools 0 to 9 with meaningful icons and tooltips
            $tools = [
              ['icon' => 'bi-eye', 'label' => 'Seen', 'tooltip' => 'Mark as seen'],
              ['icon' => 'bi-x', 'label' => 'Mark Blank', 'tooltip' => 'Mark this area as blank'],
              ['icon' => 'bi-plus-circle', 'label' => 'Add Marks', 'tooltip' => 'Add marks to this section', 'disabled' => true],
              ['icon' => 'bi-check2-circle', 'label' => 'Mark Correct', 'tooltip' => 'Mark answer as correct', 'disabled' => true],
              ['icon' => 'bi-x-circle', 'label' => 'Mark Incorrect', 'tooltip' => 'Mark answer as incorrect', 'disabled' => true],
              ['icon' => 'bi-pencil', 'label' => 'Pencil Tool', 'tooltip' => 'Freehand drawing tool', 'disabled' => true],
              ['icon' => 'bi-type', 'label' => 'Text Tool', 'tooltip' => 'Insert typed text', 'disabled' => true],
              ['icon' => 'bi-dash-lg', 'label' => 'Draw Line', 'tooltip' => 'Draw a straight line', 'disabled' => true],
              ['icon' => 'bi-square', 'label' => 'Draw Box', 'tooltip' => 'Draw a rectangle/box', 'disabled' => true],
              ['icon' => 'bi-arrow-counterclockwise', 'label' => 'Undo Tool', 'tooltip' => 'Undo last action', 'disabled' => true],
            ];

            foreach ($tools as $i => $tool): ?>
              <div class="gap-2 w-100">
                <!-- <span class="badge bg-secondary"><?= $i ?></span> -->
                <button class="btn btn-sm btn-outline-dark w-100 text-nowrap" <?= $tool['disabled'] ? 'disabled' : '' ?> data-bs-toggle="tooltip" title="<?= $tool['tooltip'] ?>">
                  <i class="bi <?= $tool['icon'] ?>"></i> <?= '<br>' . $tool['label'] ?>
                </button>
              </div>
            <?php endforeach; ?>
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
                  <?php foreach ($questions as $index => $q): ?>
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
                    <tr class="<?= $index === 0 ? 'active' : '' ?>">
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
            $totalPages = 1;
            $rows = [];
            $totalQuestions = 0;
            $totalMarksAll = 0;

            for ($page = 1; $page <= $totalPages; $page++) {
              $questionsOnPage = rand(2, 20); // Multiple questions per page

              for ($q = 1; $q <= $questionsOnPage; $q++) {
                $marks = rand(5, 20);
                $statusPassed = rand(0, 1);
                $bonus = rand(0, 3) === 3;

                $statusIcon = $statusPassed
                  ? '<i class="bi bi-check-circle-fill text-success" data-bs-toggle="tooltip" title="Attempted"></i>'
                  : '<i class="bi bi-x-circle-fill text-danger" data-bs-toggle="tooltip" title="Not Attempted"></i>';

                $bonusIcon = $bonus
                  ? ' <i class="bi bi-gift-fill text-warning" data-bs-toggle="tooltip" title="Bonus Marks Awarded"></i>'
                  : '';

                $action = "Q$q: {$marks}M $statusIcon$bonusIcon";

                if ($statusPassed) {
                  $totalMarksAll += $marks;
                }

                $rows[] = [
                  'page' => $page,
                  'qno' => "Q$q",
                  'marks' => $marks,
                  'obtained' => $statusPassed ? $marks : 0,
                  'action' => $action,
                  'status' => $statusPassed ? 'A' : 'NA',
                  'statusIcon' => $statusIcon,
                ];

                $totalQuestions++;
              }
            }
            ?>

            <!-- Bootstrap Table -->
            <div class="table-responsive">
              <table class="table table-bordered table-sm align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th data-bs-toggle="tooltip" title="Page Number">Page</th>
                    <th data-bs-toggle="tooltip" title="Question Number">Q. No</th>
                    <th data-bs-toggle="tooltip" title="Obtained Marks / Total Marks for the Question">Marks</th>
                    <th data-bs-toggle="tooltip" title="Attempted Status and Bonus">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach ($rows as $row): ?>
                    <tr>
                      <td><?= $row['page'] ?></td>
                      <td><?= $row['qno'] ?></td>
                      <td><?= $row['obtained'] ?> / <?= $row['marks'] ?></td>
                      <td><button class="btn btn-xs btn-danger w-100">Remove</button></td>
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

                      <span data-bs-toggle="tooltip" title="Total marks obtained across all questions">
                        Total Marks: <?= $totalMarksAll ?>
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div class="table-responsive bg-light" style="height: auto;">
              <div class="container-fluid py-2">
                <div class="row align-items-center g-2">

                  <!-- Left: Checkbox & Long Note (col-lg-8) -->
                  <div class="col-lg-8 col-md-12">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="confirmCheckbox">
                      <label class="form-check-label" for="confirmCheckbox">
                        I confirm that all information entered is accurate and final. I understand that once submitted, the data will be locked and cannot be edited or reversed under any circumstances.
                      </label>
                    </div>
                  </div>

                  <!-- Right: Submit & Lock Button (col-lg-4) -->
                  <div class="col-lg-4 col-md-12">
                    <button type="button" class="btn btn-success w-100" onclick="handleSubmitAndLock()">
                      <i class="bi bi-lock-fill me-1"></i> Submit & Lock
                    </button>
                  </div>

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